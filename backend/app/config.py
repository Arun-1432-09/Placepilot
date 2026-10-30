import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR.parent / "data"
MODELS_DIR = BASE_DIR.parent / "models"

DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    SECRET_KEY: str = "placepilot-super-secret-jwt-key-2026-secure-32bytes"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'placepilot.db'}"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    
    MODEL_PATH: str = str(MODELS_DIR / "placement_model.joblib")
    METADATA_PATH: str = str(MODELS_DIR / "model_metadata.json")
    DATASET_PATH: str = str(DATA_DIR / "synthetic_placement_data.csv")

    class Config:
        env_file = str(BASE_DIR / ".env")
        extra = "allow"

settings = Settings()
