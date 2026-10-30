import io
import csv
import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import User, StudentProfile, Assessment, Prediction, Recommendation
from app.schemas import (
    AdminStatsResponse, ReadinessDistribution, DepartmentStats,
    StudentListItemResponse, StudentDetailResponse,
    UserResponse, StudentProfileResponse, AssessmentResponse,
    PredictionResponse, RecommendationResponse
)
from app.dependencies import get_current_faculty

router = APIRouter(prefix="/api/admin", tags=["Faculty & Admin Dashboard"])

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_dashboard_stats(
    faculty: User = Depends(get_current_faculty),
    db: Session = Depends(get_db)
):
    """Aggregate statistics for faculty administration dashboard."""
    # Total student accounts
    total_students = db.query(User).filter(User.role == "student").count()

    # Assessed students (distinct users who have taken >= 1 assessment)
    assessed_user_ids = [
        row[0] for row in db.query(Assessment.user_id).distinct().all()
    ]
    assessed_students = len(assessed_user_ids)
    unassessed_students = max(0, total_students - assessed_students)

    total_assessments = db.query(Assessment).count()

    # Aggregate averages from latest assessments or overall
    avg_scores = db.query(
        func.avg(Assessment.cgpa),
        func.avg(Assessment.technical_score),
        func.avg(Assessment.coding_score),
        func.avg(Assessment.aptitude_score),
    ).first()

    avg_cgpa = round(float(avg_scores[0] or 0.0), 2)
    avg_tech = round(float(avg_scores[1] or 0.0), 1)
    avg_coding = round(float(avg_scores[2] or 0.0), 1)
    avg_aptitude = round(float(avg_scores[3] or 0.0), 1)

    # Readiness distribution based on each assessed student's latest prediction
    ready_count = 0
    dev_count = 0
    needs_prep_count = 0

    for uid in assessed_user_ids:
        latest_pred = (
            db.query(Prediction)
            .filter(Prediction.user_id == uid)
            .order_by(Prediction.created_at.desc())
            .first()
        )
        if latest_pred:
            cat = latest_pred.readiness_category
            if cat == "Placement Ready":
                ready_count += 1
            elif cat == "Developing":
                dev_count += 1
            elif cat == "Needs Preparation":
                needs_prep_count += 1

    # Department breakdown
    all_students = db.query(User).filter(User.role == "student").all()
    dept_map = {}
    for st in all_students:
        dept = st.department or "General Engineering"
        if dept not in dept_map:
            dept_map[dept] = {
                "student_count": 0,
                "assessed_count": 0,
                "cgpa_sum": 0.0,
                "ready_count": 0,
            }
        dept_map[dept]["student_count"] += 1
        
        # Check if student is assessed
        if st.id in assessed_user_ids:
            dept_map[dept]["assessed_count"] += 1
            # Get latest profile/assessment cgpa
            if st.profile:
                dept_map[dept]["cgpa_sum"] += st.profile.cgpa
            
            latest_pred = (
                db.query(Prediction)
                .filter(Prediction.user_id == st.id)
                .order_by(Prediction.created_at.desc())
                .first()
            )
            if latest_pred and latest_pred.readiness_category == "Placement Ready":
                dept_map[dept]["ready_count"] += 1

    dept_summary = []
    for dept_name, data in dept_map.items():
        assessed_cnt = data["assessed_count"]
        avg_dept_cgpa = round(data["cgpa_sum"] / assessed_cnt, 2) if assessed_cnt > 0 else 0.0
        dept_summary.append(
            DepartmentStats(
                department=dept_name,
                student_count=data["student_count"],
                assessed_count=assessed_cnt,
                avg_cgpa=avg_dept_cgpa,
                placement_ready_count=data["ready_count"],
            )
        )

    # Sort department summary alphabetically
    dept_summary.sort(key=lambda x: x.department)

    return AdminStatsResponse(
        total_students=total_students,
        assessed_students=assessed_students,
        unassessed_students=unassessed_students,
        total_assessments=total_assessments,
        avg_cgpa=avg_cgpa,
        avg_technical_score=avg_tech,
        avg_coding_score=avg_coding,
        avg_aptitude_score=avg_aptitude,
        readiness_distribution=ReadinessDistribution(
            placement_ready=ready_count,
            developing=dev_count,
            needs_preparation=needs_prep_count,
        ),
        department_summary=dept_summary,
    )

@router.get("/students", response_model=List[StudentListItemResponse])
def get_students_directory(
    query: Optional[str] = Query(None, description="Search by name, email, or registration number"),
    department: Optional[str] = Query(None, description="Filter by department"),
    readiness_category: Optional[str] = Query(None, description="Filter by readiness status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    faculty: User = Depends(get_current_faculty),
    db: Session = Depends(get_db)
):
    """Retrieve searchable, filterable directory of students for faculty."""
    students_query = db.query(User).filter(User.role == "student")

    if department:
        students_query = students_query.filter(User.department == department)

    if query:
        search_pattern = f"%{query.strip()}%"
        students_query = students_query.filter(
            (User.full_name.ilike(search_pattern)) |
            (User.email.ilike(search_pattern)) |
            (User.reg_number.ilike(search_pattern))
        )

    students = students_query.order_by(User.created_at.desc()).all()

    items = []
    for st in students:
        latest_assessment = (
            db.query(Assessment)
            .filter(Assessment.user_id == st.id)
            .order_by(Assessment.created_at.desc())
            .first()
        )
        latest_pred = (
            db.query(Prediction)
            .filter(Prediction.user_id == st.id)
            .order_by(Prediction.created_at.desc())
            .first()
        )
        assess_count = db.query(Assessment).filter(Assessment.user_id == st.id).count()

        # Filter by readiness category if requested
        cat = latest_pred.readiness_category if latest_pred else "Unassessed"
        if readiness_category:
            if readiness_category == "Unassessed" and latest_pred is not None:
                continue
            elif readiness_category != "Unassessed" and cat != readiness_category:
                continue

        items.append(
            StudentListItemResponse(
                id=st.id,
                full_name=st.full_name,
                email=st.email,
                reg_number=st.reg_number,
                department=st.department,
                created_at=st.created_at,
                has_profile=st.profile is not None,
                cgpa=st.profile.cgpa if st.profile else (latest_assessment.cgpa if latest_assessment else None),
                assessments_count=assess_count,
                latest_readiness_category=cat,
                latest_readiness_score=latest_pred.readiness_score if latest_pred else None,
                latest_assessment_date=latest_assessment.created_at if latest_assessment else None,
            )
        )

    return items[skip : skip + limit]

@router.get("/students/{student_id}", response_model=StudentDetailResponse)
def get_student_detail(
    student_id: int,
    faculty: User = Depends(get_current_faculty),
    db: Session = Depends(get_db)
):
    """Retrieve full educational profile and assessment history of a student."""
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    assessments = (
        db.query(Assessment)
        .filter(Assessment.user_id == student.id)
        .order_by(Assessment.created_at.desc())
        .all()
    )

    assess_responses = []
    for a in assessments:
        pred_resp = None
        if a.prediction:
            pred_resp = PredictionResponse(
                id=a.prediction.id,
                assessment_id=a.prediction.assessment_id,
                user_id=a.prediction.user_id,
                readiness_category=a.prediction.readiness_category,
                readiness_score=a.prediction.readiness_score,
                probability_ready=a.prediction.probability_ready,
                probability_developing=a.prediction.probability_developing,
                probability_needs_prep=a.prediction.probability_needs_prep,
                strongest_areas=json.loads(a.prediction.strongest_areas) if isinstance(a.prediction.strongest_areas, str) else a.prediction.strongest_areas,
                improvement_areas=json.loads(a.prediction.improvement_areas) if isinstance(a.prediction.improvement_areas, str) else a.prediction.improvement_areas,
                created_at=a.prediction.created_at,
            )
        recs = [RecommendationResponse.model_validate(r) for r in a.recommendations]

        assess_responses.append(
            AssessmentResponse(
                id=a.id,
                user_id=a.user_id,
                cgpa=a.cgpa,
                aptitude_score=a.aptitude_score,
                technical_score=a.technical_score,
                communication_score=a.communication_score,
                coding_score=a.coding_score,
                projects_count=a.projects_count,
                internships_count=a.internships_count,
                certifications_count=a.certifications_count,
                backlogs_count=a.backlogs_count,
                resume_readiness=a.resume_readiness,
                interview_prep_level=a.interview_prep_level,
                created_at=a.created_at,
                prediction=pred_resp,
                recommendations=recs,
            )
        )

    all_recs = (
        db.query(Recommendation)
        .filter(Recommendation.user_id == student.id)
        .order_by(Recommendation.created_at.desc())
        .all()
    )

    return StudentDetailResponse(
        user=UserResponse.model_validate(student),
        profile=StudentProfileResponse.model_validate(student.profile) if student.profile else None,
        assessments=assess_responses,
        recommendations=[RecommendationResponse.model_validate(r) for r in all_recs],
    )

@router.get("/export-csv")
def export_students_csv(
    faculty: User = Depends(get_current_faculty),
    db: Session = Depends(get_db)
):
    """Generate and stream a downloadable CSV report of student placement readiness."""
    output = io.StringIO()
    writer = csv.writer(output)

    # Write CSV Header
    writer.writerow([
        "Student ID",
        "Full Name",
        "Email",
        "Registration Number",
        "Department",
        "Current CGPA",
        "Assessments Count",
        "Latest Readiness Category",
        "Latest Readiness Score (%)",
        "Latest Assessment Date",
        "Coding Score",
        "Technical Score",
        "Aptitude Score",
        "Communication Score",
        "Projects Count",
        "Internships Count",
        "Backlogs Count"
    ])

    students = db.query(User).filter(User.role == "student").order_by(User.id.asc()).all()

    for st in students:
        latest_a = (
            db.query(Assessment)
            .filter(Assessment.user_id == st.id)
            .order_by(Assessment.created_at.desc())
            .first()
        )
        latest_p = (
            db.query(Prediction)
            .filter(Prediction.user_id == st.id)
            .order_by(Prediction.created_at.desc())
            .first()
        )
        assess_cnt = db.query(Assessment).filter(Assessment.user_id == st.id).count()

        writer.writerow([
            st.id,
            st.full_name,
            st.email,
            st.reg_number or "N/A",
            st.department or "General Engineering",
            st.profile.cgpa if st.profile else (latest_a.cgpa if latest_a else "N/A"),
            assess_cnt,
            latest_p.readiness_category if latest_p else "Unassessed",
            f"{latest_p.readiness_score:.1f}%" if latest_p else "N/A",
            latest_a.created_at.strftime("%Y-%m-%d %H:%M") if latest_a else "N/A",
            latest_a.coding_score if latest_a else "N/A",
            latest_a.technical_score if latest_a else "N/A",
            latest_a.aptitude_score if latest_a else "N/A",
            latest_a.communication_score if latest_a else "N/A",
            latest_a.projects_count if latest_a else "N/A",
            latest_a.internships_count if latest_a else "N/A",
            latest_a.backlogs_count if latest_a else "N/A",
        ])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=placepilot_placement_report.csv"}
    )
