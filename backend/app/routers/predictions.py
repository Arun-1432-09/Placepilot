import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Prediction
from app.schemas import PredictionResponse
from app.dependencies import get_current_user
from app.config import settings

router = APIRouter(prefix="/api/predictions", tags=["Predictions & ML Info"])

@router.get("/latest", response_model=PredictionResponse)
def get_latest_prediction(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve the current user's most recent placement readiness prediction."""
    pred = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.created_at.desc())
        .first()
    )
    if not pred:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No prediction records found. Complete an assessment first."
        )

    return PredictionResponse(
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

@router.get("/model-info")
def get_model_information():
    """Retrieve metadata, performance metrics, and features of the trained ML model."""
    meta_path = Path(settings.METADATA_PATH)
    if not meta_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model metadata is not available yet."
        )
    with open(meta_path, "r", encoding="utf-8") as f:
        metadata = json.load(f)
    return metadata
