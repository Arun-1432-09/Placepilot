from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, StudentProfile, Assessment, Prediction, Recommendation
from app.schemas import (
    StudentProfileResponse, StudentProfileUpdate, StudentDashboardSummary,
    AssessmentResponse, PredictionResponse, RecommendationResponse, UserResponse
)
from app.dependencies import get_current_student

router = APIRouter(prefix="/api/students", tags=["Student Profile & Dashboard"])

@router.get("/profile", response_model=StudentProfileResponse)
def get_student_profile(
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Retrieve the student's profile."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_student.id).first()
    if not profile:
        # Create default profile if somehow missing
        profile = StudentProfile(user_id=current_student.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("/profile", response_model=StudentProfileResponse)
def update_student_profile(
    profile_data: StudentProfileUpdate,
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Update student academic, skill, and background metrics."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_student.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_student.id)
        db.add(profile)

    for field, value in profile_data.model_dump().items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile

@router.get("/dashboard", response_model=StudentDashboardSummary)
def get_student_dashboard(
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Fetch complete live summary for the student dashboard."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_student.id).first()
    
    # Latest assessment and prediction
    latest_assessment = (
        db.query(Assessment)
        .filter(Assessment.user_id == current_student.id)
        .order_by(Assessment.created_at.desc())
        .first()
    )

    assessment_count = (
        db.query(Assessment)
        .filter(Assessment.user_id == current_student.id)
        .count()
    )

    # Active recommendations
    recs = (
        db.query(Recommendation)
        .filter(Recommendation.user_id == current_student.id)
        .order_by(Recommendation.is_completed.asc(), Recommendation.created_at.desc())
        .all()
    )

    completed_recs = sum(1 for r in recs if r.is_completed)

    # Convert latest prediction if exists
    latest_pred_resp = None
    latest_assess_resp = None
    if latest_assessment:
        pred = latest_assessment.prediction
        if pred:
            import json
            latest_pred_resp = PredictionResponse(
                id=pred.id,
                assessment_id=pred.assessment_id,
                user_id=pred.user_id,
                readiness_category=pred.readiness_category,
                readiness_score=pred.readiness_score,
                probability_ready=pred.probability_ready,
                probability_developing=pred.probability_developing,
                probability_needs_prep=pred.probability_needs_prep,
                strongest_areas=json.loads(pred.strongest_areas) if isinstance(pred.strongest_areas, str) else pred.strongest_areas,
                improvement_areas=json.loads(pred.improvement_areas) if isinstance(pred.improvement_areas, str) else pred.improvement_areas,
                created_at=pred.created_at,
            )
        
        latest_assess_resp = AssessmentResponse(
            id=latest_assessment.id,
            user_id=latest_assessment.user_id,
            cgpa=latest_assessment.cgpa,
            aptitude_score=latest_assessment.aptitude_score,
            technical_score=latest_assessment.technical_score,
            communication_score=latest_assessment.communication_score,
            coding_score=latest_assessment.coding_score,
            projects_count=latest_assessment.projects_count,
            internships_count=latest_assessment.internships_count,
            certifications_count=latest_assessment.certifications_count,
            backlogs_count=latest_assessment.backlogs_count,
            resume_readiness=latest_assessment.resume_readiness,
            interview_prep_level=latest_assessment.interview_prep_level,
            created_at=latest_assessment.created_at,
            prediction=latest_pred_resp,
            recommendations=[
                RecommendationResponse.model_validate(r) for r in recs if r.assessment_id == latest_assessment.id
            ]
        )

    return StudentDashboardSummary(
        user=UserResponse.model_validate(current_student),
        profile=StudentProfileResponse.model_validate(profile) if profile else None,
        latest_assessment=latest_assess_resp,
        latest_prediction=latest_pred_resp,
        recommendations=[RecommendationResponse.model_validate(r) for r in recs],
        assessment_count=assessment_count,
        completed_recommendations_count=completed_recs,
        total_recommendations_count=len(recs),
    )
