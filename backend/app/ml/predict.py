"""
PlacePilot - Prediction Engine & Recommendation Logic
Loads trained machine learning pipeline and generates real-time placement readiness
estimates, skill gap analysis, and personalized actionable recommendations.
"""

import json
from pathlib import Path
from typing import Dict, Any, List, Tuple
import pandas as pd
import numpy as np
import joblib

from app.config import settings
from app.ml.data_generator import FEATURE_COLUMNS
from app.ml.train_model import train_and_save_model

_MODEL_PIPELINE = None
_MODEL_METADATA = None

def get_model():
    """Load or lazily initialize the trained Scikit-learn pipeline."""
    global _MODEL_PIPELINE, _MODEL_METADATA
    model_path = Path(settings.MODEL_PATH)

    if _MODEL_PIPELINE is None:
        if not model_path.exists():
            print(f"Model file not found at {model_path}. Training model now...")
            train_and_save_model()
        
        _MODEL_PIPELINE = joblib.load(model_path)
        
        meta_path = Path(settings.METADATA_PATH)
        if meta_path.exists():
            with open(meta_path, "r", encoding="utf-8") as f:
                _MODEL_METADATA = json.load(f)

    return _MODEL_PIPELINE

def analyze_strengths_and_gaps(features: Dict[str, Any]) -> Tuple[List[str], List[str]]:
    """Determine a student's strongest assets and primary areas needing improvement."""
    benchmarks = {
        "Coding & Problem Solving": (features.get("coding_score", 0), 75.0, 60.0),
        "Technical Domain Knowledge": (features.get("technical_score", 0), 75.0, 60.0),
        "Aptitude & Logical Reasoning": (features.get("aptitude_score", 0), 75.0, 60.0),
        "Communication & Interview Polish": (features.get("communication_score", 0), 75.0, 60.0),
        "Academic Consistency (CGPA)": (features.get("cgpa", 0) * 10.0, 80.0, 65.0),
        "Practical Project Portfolio": (features.get("projects_count", 0) * 25.0, 75.0, 50.0),
        "Industry Experience (Internships)": (features.get("internships_count", 0) * 50.0, 50.0, 25.0),
        "Resume Readiness": (features.get("resume_readiness", 0), 80.0, 65.0),
    }

    # Evaluate backlogs
    backlogs = features.get("backlogs_count", 0)

    strengths = []
    improvements = []

    for label, (val, high_thresh, med_thresh) in benchmarks.items():
        if val >= high_thresh:
            strengths.append(label)
        elif val < med_thresh:
            improvements.append(label)

    if backlogs > 0:
        improvements.append(f"Active Backlogs Resolution ({backlogs} pending)")

    # Fallback to ensure informative feedback
    if not strengths:
        # Pick the highest scoring benchmark
        best = max(benchmarks.items(), key=lambda x: x[1][0])
        strengths.append(best[0])
    
    if not improvements:
        # Pick the lowest scoring benchmark
        worst = min(benchmarks.items(), key=lambda x: x[1][0])
        improvements.append(worst[0])

    return strengths[:4], improvements[:4]

def generate_personalized_recommendations(features: Dict[str, Any], readiness_category: str) -> List[Dict[str, Any]]:
    """Generate targeted, actionable preparation recommendations based on profile metrics."""
    recs = []

    # 1. Coding score
    coding = features.get("coding_score", 0)
    if coding < 60:
        recs.append({
            "area": "Coding & Problem Solving",
            "priority": "High",
            "reason": f"Your coding assessment score ({coding}/100) indicates gaps in algorithmic problem solving and data structures.",
            "action": "Complete at least 2 medium problems daily on LeetCode/HackerRank focusing on Arrays, HashMaps, Trees, and Dynamic Programming."
        })
    elif coding < 75:
        recs.append({
            "area": "Coding Optimization",
            "priority": "Medium",
            "reason": f"Your coding score ({coding}/100) is solid, but competitive placements require higher algorithmic fluency.",
            "action": "Practice timed mock contests and optimize time & space complexities on standard interview patterns."
        })

    # 2. Aptitude & Logical Reasoning
    aptitude = features.get("aptitude_score", 0)
    if aptitude < 65:
        recs.append({
            "area": "Aptitude & Quantitative Skills",
            "priority": "High",
            "reason": f"Campus recruitment round 1 extensively filters by aptitude. Your current score ({aptitude}/100) needs strengthening.",
            "action": "Dedicate 45 minutes daily to Quantitative Aptitude (Permutations, Probability, Time & Work) and Logical Deductions via IndiaBIX or RS Aggarwal."
        })

    # 3. Technical Core
    technical = features.get("technical_score", 0)
    if technical < 65:
        recs.append({
            "area": "Technical Core Fundamentals",
            "priority": "High",
            "reason": f"Technical assessment score ({technical}/100) shows gaps in core CS fundamentals (OS, DBMS, OOP, Computer Networks).",
            "action": "Revise DBMS normal forms, ACID properties, SQL queries, OS scheduling, and virtual memory concepts with concise revision sheets."
        })

    # 4. Projects
    projects = features.get("projects_count", 0)
    if projects < 2:
        recs.append({
            "area": "Project Portfolio",
            "priority": "High",
            "reason": f"You currently have {projects} project(s) listed. Recruiters look for at least 2 substantial, deployable projects.",
            "action": "Build and deploy a full-stack web or ML application on GitHub with clear README documentation and a live demo URL."
        })

    # 5. Internships
    internships = features.get("internships_count", 0)
    if internships == 0:
        recs.append({
            "area": "Practical Industry Experience",
            "priority": "Medium",
            "reason": "Prior internship experience significantly boosts interview shortlisting probability.",
            "action": "Apply to targeted student internships on Wellfound, Internshala, or contribute to recognized open-source projects."
        })

    # 6. Communication & Interview Polish
    comm = features.get("communication_score", 0)
    interview_level = features.get("interview_prep_level", "Beginner")
    if comm < 68 or interview_level == "Beginner":
        recs.append({
            "area": "Communication & Behavioral Interview",
            "priority": "Medium" if comm >= 60 else "High",
            "reason": f"Communication score ({comm}/100) and {interview_level} interview prep level may cause friction in HR/managerial rounds.",
            "action": "Practice behavioral questions using the STAR technique (Situation, Task, Action, Result) and record 3-minute video mock responses."
        })

    # 7. Resume Readiness
    resume = features.get("resume_readiness", 0)
    if resume < 75:
        recs.append({
            "area": "Resume Optimization",
            "priority": "Medium",
            "reason": f"Self-rated resume readiness is {resume}/100. Unoptimized resumes struggle through ATS automated parsers.",
            "action": "Adopt a single-page clean template (e.g. Jake's Resume) with quantifiable impact metrics ('increased X by Y% using Z') and verified links."
        })

    # 8. Backlogs
    backlogs = features.get("backlogs_count", 0)
    if backlogs > 0:
        recs.append({
            "area": "Academic Backlogs Clearance",
            "priority": "High",
            "reason": f"You have {backlogs} active backlog(s). Most Tier-1 campus placement drives require zero active backlogs at recruitment time.",
            "action": "Prioritize upcoming supplementary examinations with academic advisors to clear all backlogs prior to company drive registrations."
        })

    # Default fallback if student is already high-performing
    if len(recs) == 0:
        recs.append({
            "area": "System Design & Advanced Prep",
            "priority": "Low",
            "reason": "Your fundamentals are strong across all tracked placement dimensions.",
            "action": "Study high-level System Design patterns, scalability concepts, and mock interview with senior alumni to target top-tier dream offers."
        })

    return recs

def predict_placement_readiness(features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Execute Scikit-Learn ML inference on student input features.
    Returns predicted category, readiness score %, class probabilities,
    strengths, gaps, and personalized recommendations.
    """
    pipeline = get_model()

    # Build input DataFrame matching exact training feature order
    row_data = {feat: [features.get(feat, 0)] for feat in FEATURE_COLUMNS}
    X_input = pd.DataFrame(row_data)

    # Scikit-learn predictions
    predicted_category = pipeline.predict(X_input)[0]
    probabilities = pipeline.predict_proba(X_input)[0]
    class_labels = list(pipeline.classes_)

    # Map class probabilities
    prob_map = {cls: float(prob) for cls, prob in zip(class_labels, probabilities)}
    prob_ready = prob_map.get("Placement Ready", 0.0)
    prob_dev = prob_map.get("Developing", 0.0)
    prob_needs = prob_map.get("Needs Preparation", 0.0)

    # Continuous Readiness Score calculation (0 - 100 scale)
    # Reflects the probabilistic placement readiness confidence
    readiness_score = round(
        (prob_needs * 25.0) + (prob_dev * 65.0) + (prob_ready * 95.0),
        1
    )
    readiness_score = float(np.clip(readiness_score, 5.0, 99.0))

    strengths, improvements = analyze_strengths_and_gaps(features)
    recommendations = generate_personalized_recommendations(features, predicted_category)

    return {
        "readiness_category": predicted_category,
        "readiness_score": readiness_score,
        "probability_ready": round(prob_ready, 4),
        "probability_developing": round(prob_dev, 4),
        "probability_needs_prep": round(prob_needs, 4),
        "strongest_areas": strengths,
        "improvement_areas": improvements,
        "recommendations": recommendations,
    }
