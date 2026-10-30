import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, StudentProfile, Assessment, Prediction, Recommendation
from app.schemas import (
    AssessmentCreate, AssessmentResponse, AssessmentWithResultResponse,
    PredictionResponse, RecommendationResponse
)
from app.dependencies import get_current_student
from app.ml.predict import predict_placement_readiness

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])

@router.post("", response_model=AssessmentWithResultResponse, status_code=status.HTTP_201_CREATED)
def create_assessment(
    assessment_data: AssessmentCreate,
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """
    Submit a placement readiness assessment.
    Triggers machine learning inference, generates prediction, saves records,
    creates personalized recommendations, and updates student profile.
    """
    # 1. Create Assessment record
    assessment = Assessment(
        user_id=current_student.id,
        cgpa=assessment_data.cgpa,
        aptitude_score=assessment_data.aptitude_score,
        technical_score=assessment_data.technical_score,
        communication_score=assessment_data.communication_score,
        coding_score=assessment_data.coding_score,
        projects_count=assessment_data.projects_count,
        internships_count=assessment_data.internships_count,
        certifications_count=assessment_data.certifications_count,
        backlogs_count=assessment_data.backlogs_count,
        resume_readiness=assessment_data.resume_readiness,
        interview_prep_level=assessment_data.interview_prep_level,
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    # 2. Run real Machine Learning Prediction
    features = assessment_data.model_dump()
    ml_result = predict_placement_readiness(features)

    # 3. Save Prediction record
    prediction = Prediction(
        assessment_id=assessment.id,
        user_id=current_student.id,
        readiness_category=ml_result["readiness_category"],
        readiness_score=ml_result["readiness_score"],
        probability_ready=ml_result["probability_ready"],
        probability_developing=ml_result["probability_developing"],
        probability_needs_prep=ml_result["probability_needs_prep"],
        strongest_areas=json.dumps(ml_result["strongest_areas"]),
        improvement_areas=json.dumps(ml_result["improvement_areas"]),
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    # 4. Save generated Recommendations
    saved_recs = []
    for rec_data in ml_result["recommendations"]:
        rec = Recommendation(
            user_id=current_student.id,
            assessment_id=assessment.id,
            area=rec_data["area"],
            reason=rec_data["reason"],
            action=rec_data["action"],
            priority=rec_data["priority"],
            is_completed=False,
        )
        db.add(rec)
        saved_recs.append(rec)
    db.commit()
    for rec in saved_recs:
        db.refresh(rec)

    # 5. Update Student Profile with the latest assessment metrics
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_student.id).first()
    if profile:
        profile.cgpa = assessment_data.cgpa
        profile.aptitude_score = assessment_data.aptitude_score
        profile.technical_score = assessment_data.technical_score
        profile.communication_score = assessment_data.communication_score
        profile.coding_score = assessment_data.coding_score
        profile.projects_count = assessment_data.projects_count
        profile.internships_count = assessment_data.internships_count
        profile.certifications_count = assessment_data.certifications_count
        profile.backlogs_count = assessment_data.backlogs_count
        profile.resume_readiness = assessment_data.resume_readiness
        profile.interview_prep_level = assessment_data.interview_prep_level
        db.commit()

    # Format response
    pred_response = PredictionResponse(
        id=prediction.id,
        assessment_id=prediction.assessment_id,
        user_id=prediction.user_id,
        readiness_category=prediction.readiness_category,
        readiness_score=prediction.readiness_score,
        probability_ready=prediction.probability_ready,
        probability_developing=prediction.probability_developing,
        probability_needs_prep=prediction.probability_needs_prep,
        strongest_areas=ml_result["strongest_areas"],
        improvement_areas=ml_result["improvement_areas"],
        created_at=prediction.created_at,
    )

    rec_responses = [RecommendationResponse.model_validate(r) for r in saved_recs]

    assess_response = AssessmentResponse(
        id=assessment.id,
        user_id=assessment.user_id,
        cgpa=assessment.cgpa,
        aptitude_score=assessment.aptitude_score,
        technical_score=assessment.technical_score,
        communication_score=assessment.communication_score,
        coding_score=assessment.coding_score,
        projects_count=assessment.projects_count,
        internships_count=assessment.internships_count,
        certifications_count=assessment.certifications_count,
        backlogs_count=assessment.backlogs_count,
        resume_readiness=assessment.resume_readiness,
        interview_prep_level=assessment.interview_prep_level,
        created_at=assessment.created_at,
        prediction=pred_response,
        recommendations=rec_responses,
    )

    return AssessmentWithResultResponse(
        assessment=assess_response,
        prediction=pred_response,
        recommendations=rec_responses,
    )

@router.get("", response_model=List[AssessmentResponse])
def get_student_assessments(
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """List historical assessments completed by the student."""
    assessments = (
        db.query(Assessment)
        .filter(Assessment.user_id == current_student.id)
        .order_by(Assessment.created_at.desc())
        .all()
    )

    results = []
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

        results.append(
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

    return results

@router.get("/{assessment_id}", response_model=AssessmentResponse)
def get_assessment_detail(
    assessment_id: int,
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Retrieve full details of a specific past assessment."""
    assessment = (
        db.query(Assessment)
        .filter(Assessment.id == assessment_id, Assessment.user_id == current_student.id)
        .first()
    )
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    pred_resp = None
    if assessment.prediction:
        pred_resp = PredictionResponse(
            id=assessment.prediction.id,
            assessment_id=assessment.prediction.assessment_id,
            user_id=assessment.prediction.user_id,
            readiness_category=assessment.prediction.readiness_category,
            readiness_score=assessment.prediction.readiness_score,
            probability_ready=assessment.prediction.probability_ready,
            probability_developing=assessment.prediction.probability_developing,
            probability_needs_prep=assessment.prediction.probability_needs_prep,
            strongest_areas=json.loads(assessment.prediction.strongest_areas) if isinstance(assessment.prediction.strongest_areas, str) else assessment.prediction.strongest_areas,
            improvement_areas=json.loads(assessment.prediction.improvement_areas) if isinstance(assessment.prediction.improvement_areas, str) else assessment.prediction.improvement_areas,
            created_at=assessment.prediction.created_at,
        )

    return AssessmentResponse(
        id=assessment.id,
        user_id=assessment.user_id,
        cgpa=assessment.cgpa,
        aptitude_score=assessment.aptitude_score,
        technical_score=assessment.technical_score,
        communication_score=assessment.communication_score,
        coding_score=assessment.coding_score,
        projects_count=assessment.projects_count,
        internships_count=assessment.internships_count,
        certifications_count=assessment.certifications_count,
        backlogs_count=assessment.backlogs_count,
        resume_readiness=assessment.resume_readiness,
        interview_prep_level=assessment.interview_prep_level,
        created_at=assessment.created_at,
        prediction=pred_resp,
        recommendations=[RecommendationResponse.model_validate(r) for r in assessment.recommendations],
    )
