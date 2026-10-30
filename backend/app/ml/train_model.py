"""
PlacePilot - ML Model Training Pipeline
Trains a Scikit-Learn RandomForest classifier with StandardScaler
to predict campus placement readiness categories.
"""

import os
import json
import datetime
import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report
)
from app.config import settings
from app.ml.data_generator import FEATURE_COLUMNS, generate_placement_dataset

TARGET_CLASSES = ["Needs Preparation", "Developing", "Placement Ready"]

def train_and_save_model() -> dict:
    """Train the placement readiness classification pipeline and save artifacts."""
    dataset_path = Path(settings.DATASET_PATH)
    if not dataset_path.exists():
        print(f"Dataset not found at {dataset_path}, generating synthetic dataset...")
        df = generate_placement_dataset()
        dataset_path.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(dataset_path, index=False)
    else:
        df = pd.read_csv(dataset_path)

    print(f"Loaded dataset with {len(df)} samples.")
    print("Class distribution:")
    print(df["readiness_category"].value_counts())

    # Separate features and target
    X = df[FEATURE_COLUMNS]
    y = df["readiness_category"]

    # Stratified Train/Test Split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # Scikit-learn Pipeline: Scaling + Random Forest Classifier
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", RandomForestClassifier(
            n_estimators=150,
            max_depth=7,
            min_samples_split=4,
            min_samples_leaf=2,
            random_state=42
        ))
    ])

    print("Training Random Forest classification pipeline...")
    pipeline.fit(X_train, y_train)

    # Evaluation
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)

    acc = float(accuracy_score(y_test, y_pred))
    prec_weighted = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
    rec_weighted = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
    f1_weighted = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))
    conf_mat = confusion_matrix(y_test, y_pred, labels=TARGET_CLASSES).tolist()

    # Per-class metrics
    class_report = classification_report(y_test, y_pred, labels=TARGET_CLASSES, output_dict=True, zero_division=0)

    # Feature Importances from Random Forest
    rf_step = pipeline.named_steps["classifier"]
    feature_importances = {
        feat: float(round(imp, 4))
        for feat, imp in zip(FEATURE_COLUMNS, rf_step.feature_importances_)
    }

    # Save Pipeline artifact
    model_path = Path(settings.MODEL_PATH)
    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, model_path)
    print(f"Model saved to {model_path}")

    # Save metadata
    metadata = {
        "model_type": "RandomForestClassifier with StandardScaler",
        "trained_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "n_samples": len(df),
        "features": FEATURE_COLUMNS,
        "classes": TARGET_CLASSES,
        "metrics": {
            "accuracy": round(acc, 4),
            "precision_weighted": round(prec_weighted, 4),
            "recall_weighted": round(rec_weighted, 4),
            "f1_score_weighted": round(f1_weighted, 4),
            "confusion_matrix": conf_mat,
            "class_report": class_report,
        },
        "feature_importances": feature_importances,
        "dataset_origin": "Synthetic institutional training data (reproducible seed 42)",
        "intended_use": "Educational campus placement readiness guidance and skill gap detection."
    }

    metadata_path = Path(settings.METADATA_PATH)
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata saved to {metadata_path}")

    print("\n--- Training Results ---")
    print(f"Accuracy:  {acc:.2%}")
    print(f"Precision: {prec_weighted:.2%}")
    print(f"Recall:    {rec_weighted:.2%}")
    print(f"F1 Score:  {f1_weighted:.2%}")
    print("Confusion Matrix:")
    print(np.array(conf_mat))

    return metadata

if __name__ == "__main__":
    train_and_save_model()
