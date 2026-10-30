import json
import asyncio
import pytest
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException

from app.database import Base
from app.models import User, StudentProfile, Assessment, Prediction, Recommendation
from app.schemas import (
    UserRegister, UserLogin, UserUpdate,
    StudentProfileUpdate, AssessmentCreate, RecommendationUpdate
)
from app.auth import hash_password, verify_password, create_access_token, decode_access_token
from app.dependencies import get_current_student, get_current_faculty
from app.routers import auth, students, assessments, predictions, recommendations, admin
from app.main import health_check

TEST_DB_PATH = Path(__file__).parent / "test_placepilot.db"
if TEST_DB_PATH.exists():
    try:
        TEST_DB_PATH.unlink()
    except Exception:
        pass

SQLALCHEMY_DATABASE_URL = f"sqlite:///{TEST_DB_PATH}"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)
    if TEST_DB_PATH.exists():
        try:
            TEST_DB_PATH.unlink()
        except Exception:
            pass

@pytest.fixture(scope="module")
def faculty_user(db):
    user = User(
        email="faculty.test@placepilot.edu",
        hashed_password=hash_password("FacultyPass@123"),
        full_name="Prof. Sarah Jenkins",
        role="faculty",
        department="Computer Science & Engineering"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture(scope="module")
def student_user(db):
    user = User(
        email="student.test@placepilot.edu",
        hashed_password=hash_password("StudentPass@123"),
        full_name="Alex Mercer",
        role="student",
        reg_number="2024CS0142",
        department="Computer Science & Engineering"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = StudentProfile(
        user_id=user.id,
        degree="B.Tech",
        current_year=4,
        cgpa=8.2,
        aptitude_score=75.0,
        technical_score=78.0,
        communication_score=72.0,
        coding_score=80.0,
        projects_count=2,
        internships_count=1,
        certifications_count=2,
        technical_skills="Python, SQL, React",
        backlogs_count=0,
        interview_prep_level="Intermediate",
        resume_readiness=80.0
    )
    db.add(profile)
    db.commit()
    return user

# ----------------- Unit & Integration Tests -----------------

def test_health_check_endpoint():
    res = health_check()
    assert res["status"] == "healthy"
    assert res["database"] == "connected"
    assert res["ml_engine"] == "operational"

def test_password_hashing():
    pw = "SecretP@ssword123"
    hashed = hash_password(pw)
    assert hashed != pw
    assert verify_password(pw, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_token_creation_and_decoding():
    token = create_access_token({"sub": "42", "role": "student"})
    token_data = decode_access_token(token)
    assert token_data.user_id == 42
    assert token_data.role == "student"

def test_user_registration(db):
    reg_data = UserRegister(
        email="new.student@placepilot.edu",
        password="SecurePassword@123",
        full_name="Jane Doe",
        role="student",
        reg_number="2024CS0999",
        department="Information Technology"
    )
    new_user = auth.register(reg_data, db)
    assert new_user.id is not None
    assert new_user.email == "new.student@placepilot.edu"
    assert new_user.role == "student"
    assert new_user.profile is not None
    assert new_user.profile.cgpa == 7.5

def test_duplicate_registration_raises_http_exception(db):
    reg_data = UserRegister(
        email="new.student@placepilot.edu",
        password="AnotherPassword@123",
        full_name="Duplicate Jane",
        role="student"
    )
    with pytest.raises(HTTPException) as exc_info:
        auth.register(reg_data, db)
    assert exc_info.value.status_code == 400
    assert "already exists" in exc_info.value.detail

def test_user_login_success(db):
    login_data = UserLogin(
        email="new.student@placepilot.edu",
        password="SecurePassword@123"
    )
    token_resp = auth.login(login_data, db)
    assert "access_token" in token_resp
    assert token_resp["user"].email == "new.student@placepilot.edu"

def test_user_login_invalid_password(db):
    login_data = UserLogin(
        email="new.student@placepilot.edu",
        password="IncorrectPassword"
    )
    with pytest.raises(HTTPException) as exc_info:
        auth.login(login_data, db)
    assert exc_info.value.status_code == 401

def test_role_based_access_restriction(student_user, faculty_user):
    # Student cannot access faculty endpoints
    with pytest.raises(HTTPException) as exc_info:
        get_current_faculty(current_user=student_user)
    assert exc_info.value.status_code == 403

    # Faculty cannot access student endpoints
    with pytest.raises(HTTPException) as exc_info:
        get_current_student(current_user=faculty_user)
    assert exc_info.value.status_code == 403

    # Legitimate access succeeds
    assert get_current_student(current_user=student_user).id == student_user.id
    assert get_current_faculty(current_user=faculty_user).id == faculty_user.id

def test_student_profile_get_and_update(db, student_user):
    # Fetch profile
    profile = students.get_student_profile(current_student=student_user, db=db)
    assert profile.cgpa == 8.2

    # Update profile
    update_data = StudentProfileUpdate(
        degree="B.Tech",
        current_year=4,
        cgpa=8.65,
        aptitude_score=80.0,
        technical_score=85.0,
        communication_score=78.0,
        coding_score=88.0,
        projects_count=3,
        internships_count=1,
        certifications_count=2,
        technical_skills="Python, FastAPI, TypeScript, React",
        backlogs_count=0,
        interview_prep_level="Advanced",
        resume_readiness=85.0
    )
    updated = students.update_student_profile(update_data, current_student=student_user, db=db)
    assert updated.cgpa == 8.65
    assert updated.coding_score == 88.0

def test_assessment_submission_and_ml_prediction(db, student_user):
    assessment_data = AssessmentCreate(
        cgpa=8.75,
        aptitude_score=84.0,
        technical_score=86.0,
        communication_score=80.0,
        coding_score=88.0,
        projects_count=3,
        internships_count=1,
        certifications_count=2,
        backlogs_count=0,
        resume_readiness=88.0,
        interview_prep_level="Advanced"
    )

    result = assessments.create_assessment(assessment_data, current_student=student_user, db=db)
    
    # 1. Check assessment record
    assert result.assessment.id is not None
    assert result.assessment.cgpa == 8.75

    # 2. Check ML prediction output
    pred = result.prediction
    assert pred.readiness_category in ["Placement Ready", "Developing", "Needs Preparation"]
    assert 0.0 <= pred.readiness_score <= 100.0
    assert 0.0 <= pred.probability_ready <= 1.0
    assert len(pred.strongest_areas) > 0
    assert "guarantee" in pred.disclaimer.lower()

    # 3. Check generated recommendations
    recs = result.recommendations
    assert isinstance(recs, list)
    for r in recs:
        assert r.priority in ["High", "Medium", "Low"]
        assert r.is_completed is False

    # 4. Check that student profile was updated with latest values
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == student_user.id).first()
    assert profile.cgpa == 8.75
    assert profile.technical_score == 86.0

def test_assessment_history_retrieval(db, student_user):
    history = assessments.get_student_assessments(current_student=student_user, db=db)
    assert len(history) >= 1
    assert history[0].prediction is not None
    assert history[0].prediction.readiness_score > 0

def test_recommendation_toggle(db, student_user):
    user_recs = recommendations.get_recommendations(current_student=student_user, db=db)
    assert len(user_recs) > 0
    first_rec = user_recs[0]
    initial_status = first_rec.is_completed

    toggled = recommendations.toggle_recommendation_completion(first_rec.id, current_student=student_user, db=db)
    assert toggled.is_completed != initial_status
    if toggled.is_completed:
        assert toggled.completed_at is not None

def test_student_dashboard_summary(db, student_user):
    dash = students.get_student_dashboard(current_student=student_user, db=db)
    assert dash.user.id == student_user.id
    assert dash.latest_assessment is not None
    assert dash.latest_prediction is not None
    assert dash.assessment_count >= 1
    assert len(dash.recommendations) >= 1

def test_admin_dashboard_stats(db, faculty_user):
    stats = admin.get_admin_dashboard_stats(faculty=faculty_user, db=db)
    assert stats.total_students >= 1
    assert stats.assessed_students >= 1
    assert stats.avg_cgpa > 0.0
    assert stats.readiness_distribution.placement_ready >= 0
    assert len(stats.department_summary) >= 1

def test_admin_student_directory_and_filter(db, faculty_user):
    # All students
    students_list = admin.get_students_directory(
        query=None, department=None, readiness_category=None,
        skip=0, limit=50, faculty=faculty_user, db=db
    )
    assert len(students_list) >= 1

    # Search by email
    filtered = admin.get_students_directory(
        query="student.test", department=None, readiness_category=None,
        skip=0, limit=50, faculty=faculty_user, db=db
    )
    assert len(filtered) == 1
    assert filtered[0].email == "student.test@placepilot.edu"

def test_admin_student_detail(db, faculty_user, student_user):
    detail = admin.get_student_detail(student_id=student_user.id, faculty=faculty_user, db=db)
    assert detail.user.id == student_user.id
    assert detail.profile is not None
    assert len(detail.assessments) >= 1

def test_admin_csv_export(db, faculty_user):
    resp = admin.export_students_csv(faculty=faculty_user, db=db)
    assert resp.status_code == 200
    content = resp.body.decode("utf-8")
    assert "Student ID,Full Name,Email" in content
    assert "student.test@placepilot.edu" in content
