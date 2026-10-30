"""
PlacePilot - Synthetic Educational Placement Dataset Generator
Generates realistic, varied synthetic student academic & skill profiles
with placement readiness targets.

NOTE: This dataset is synthetic and modeled for educational demonstration.
It reflects institutional skill assessments and does not represent real personal data.
"""

import numpy as np
import pandas as pd
from pathlib import Path
from app.config import settings

FEATURE_COLUMNS = [
    "cgpa",
    "aptitude_score",
    "technical_score",
    "communication_score",
    "coding_score",
    "projects_count",
    "internships_count",
    "certifications_count",
    "backlogs_count",
    "resume_readiness",
]

def generate_placement_dataset(n_samples: int = 2000, random_seed: int = 42) -> pd.DataFrame:
    """Generate a realistic synthetic student placement dataset."""
    rng = np.random.default_rng(random_seed)

    # Academic & Skill distributions
    cgpa = np.clip(rng.normal(loc=7.6, scale=0.95, size=n_samples), 5.2, 9.9)
    aptitude_score = np.clip(rng.normal(loc=68.0, scale=14.0, size=n_samples), 30.0, 99.0)
    technical_score = np.clip(rng.normal(loc=66.0, scale=15.0, size=n_samples), 30.0, 99.0)
    communication_score = np.clip(rng.normal(loc=70.0, scale=13.0, size=n_samples), 35.0, 99.0)
    coding_score = np.clip(rng.normal(loc=64.0, scale=16.0, size=n_samples), 25.0, 99.0)

    # Discrete experiences with correlated probability
    projects_count = rng.choice([0, 1, 2, 3, 4, 5], size=n_samples, p=[0.05, 0.20, 0.40, 0.22, 0.10, 0.03])
    internships_count = rng.choice([0, 1, 2, 3], size=n_samples, p=[0.50, 0.35, 0.12, 0.03])
    certifications_count = rng.choice([0, 1, 2, 3, 4], size=n_samples, p=[0.20, 0.40, 0.25, 0.10, 0.05])
    backlogs_count = rng.choice([0, 1, 2, 3], size=n_samples, p=[0.75, 0.16, 0.06, 0.03])
    resume_readiness = np.clip(rng.normal(loc=72.0, scale=14.0, size=n_samples), 30.0, 99.0)

    # Normalized component weights for ground truth calculation
    norm_cgpa = (cgpa - 5.0) / 5.0
    norm_aptitude = aptitude_score / 100.0
    norm_technical = technical_score / 100.0
    norm_comm = communication_score / 100.0
    norm_coding = coding_score / 100.0
    norm_projects = np.minimum(projects_count, 4) / 4.0
    norm_internships = np.minimum(internships_count, 2) / 2.0
    norm_certs = np.minimum(certifications_count, 3) / 3.0
    norm_resume = resume_readiness / 100.0
    backlog_penalty = np.minimum(backlogs_count, 3) * 0.08

    # Realistic Composite Index
    composite_index = (
        0.22 * norm_cgpa +
        0.18 * norm_coding +
        0.16 * norm_technical +
        0.13 * norm_aptitude +
        0.11 * norm_comm +
        0.08 * norm_internships +
        0.06 * norm_projects +
        0.04 * norm_certs +
        0.02 * norm_resume -
        backlog_penalty +
        rng.normal(0, 0.03, size=n_samples)
    )

    composite_index = np.clip(composite_index, 0.05, 0.98)

    # Class assignment: Placement Ready (2), Developing (1), Needs Preparation (0)
    categories = []
    for score in composite_index:
        if score >= 0.67:
            categories.append("Placement Ready")
        elif score >= 0.46:
            categories.append("Developing")
        else:
            categories.append("Needs Preparation")

    df = pd.DataFrame({
        "cgpa": np.round(cgpa, 2),
        "aptitude_score": np.round(aptitude_score, 1),
        "technical_score": np.round(technical_score, 1),
        "communication_score": np.round(communication_score, 1),
        "coding_score": np.round(coding_score, 1),
        "projects_count": projects_count,
        "internships_count": internships_count,
        "certifications_count": certifications_count,
        "backlogs_count": backlogs_count,
        "resume_readiness": np.round(resume_readiness, 1),
        "readiness_category": categories,
    })

    return df

def save_synthetic_dataset(path: str = None) -> str:
    target_path = Path(path or settings.DATASET_PATH)
    target_path.parent.mkdir(parents=True, exist_ok=True)
    df = generate_placement_dataset()
    df.to_csv(target_path, index=False)
    return str(target_path)

if __name__ == "__main__":
    p = save_synthetic_dataset()
    print(f"Synthetic placement dataset created at {p}")
