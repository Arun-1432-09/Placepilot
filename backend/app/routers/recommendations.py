import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Recommendation
from app.schemas import RecommendationResponse, RecommendationUpdate
from app.dependencies import get_current_student

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])

@router.get("", response_model=List[RecommendationResponse])
def get_recommendations(
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """List all personalized preparation recommendations for the current student."""
    recs = (
        db.query(Recommendation)
        .filter(Recommendation.user_id == current_student.id)
        .order_by(Recommendation.is_completed.asc(), Recommendation.created_at.desc())
        .all()
    )
    return recs

@router.patch("/{rec_id}/toggle", response_model=RecommendationResponse)
def toggle_recommendation_completion(
    rec_id: int,
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Toggle a recommendation's completion status."""
    rec = (
        db.query(Recommendation)
        .filter(Recommendation.id == rec_id, Recommendation.user_id == current_student.id)
        .first()
    )
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found")

    rec.is_completed = not rec.is_completed
    rec.completed_at = datetime.datetime.now(datetime.timezone.utc) if rec.is_completed else None

    db.commit()
    db.refresh(rec)
    return rec

@router.put("/{rec_id}", response_model=RecommendationResponse)
def update_recommendation_status(
    rec_id: int,
    update_data: RecommendationUpdate,
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Explicitly set recommendation completion status."""
    rec = (
        db.query(Recommendation)
        .filter(Recommendation.id == rec_id, Recommendation.user_id == current_student.id)
        .first()
    )
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found")

    rec.is_completed = update_data.is_completed
    rec.completed_at = datetime.datetime.now(datetime.timezone.utc) if rec.is_completed else None

    db.commit()
    db.refresh(rec)
    return rec
