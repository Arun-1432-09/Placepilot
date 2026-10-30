"""
PlacePilot - Database Seed Script
Creates default demo accounts (faculty and student) along with realistic
sample student profiles, assessments, and ML prediction records.
"""

import json
from app.database import SessionLocal, Base, engine
from app.models import User, StudentProfile, Assessment, Prediction, Recommendation
from app.auth import hash_password
from app.ml.predict import predict_placement_readiness

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if faculty already exists
        faculty = db.query(User).filter(User.email == "faculty@placepilot.edu").first()
        if not faculty:
            print("Creating demo faculty account (faculty@placepilot.edu)...")
            faculty = User(
                email="faculty@placepilot.edu",
                hashed_password=hash_password("Faculty@123"),
                full_name="Dr. Sarah Jenkins",
                role="faculty",
                reg_number="FAC-2024-001",
                department="Computer Science & Engineering"
            )
            db.add(faculty)
            db.commit()

        # Check if demo student exists
        demo_student = db.query(User).filter(User.email == "student@placepilot.edu").first()
        if not demo_student:
            print("Creating demo student account (student@placepilot.edu)...")
            demo_student = User(
                email="student@placepilot.edu",
                hashed_password=hash_password("Student@123"),
                full_name="Alex Mercer",
                role="student",
                reg_number="2024CS0142",
                department="Computer Science & Engineering"
            )
            db.add(demo_student)
            db.commit()
            db.refresh(demo_student)

            # Profile
            profile = StudentProfile(
                user_id=demo_student.id,
                degree="B.Tech",
                current_year=4,
                cgpa=8.45,
                aptitude_score=78.0,
                technical_score=82.0,
                communication_score=75.0,
                coding_score=85.0,
                projects_count=3,
                internships_count=1,
                certifications_count=2,
                technical_skills="React, TypeScript, Python, FastAPI, Docker, PostgreSQL",
                backlogs_count=0,
                interview_prep_level="Intermediate",
                resume_readiness=85.0
            )
            db.add(profile)
            db.commit()

            # Seed an initial assessment & prediction for demo student
            assess_features = {
                "cgpa": 8.45,
                "aptitude_score": 78.0,
                "technical_score": 82.0,
                "communication_score": 75.0,
                "coding_score": 85.0,
                "projects_count": 3,
                "internships_count": 1,
                "certifications_count": 2,
                "backlogs_count": 0,
                "resume_readiness": 85.0,
                "interview_prep_level": "Intermediate"
            }
            assessment = Assessment(user_id=demo_student.id, **assess_features)
            db.add(assessment)
            db.commit()
            db.refresh(assessment)

            pred_data = predict_placement_readiness(assess_features)
            prediction = Prediction(
                assessment_id=assessment.id,
                user_id=demo_student.id,
                readiness_category=pred_data["readiness_category"],
                readiness_score=pred_data["readiness_score"],
                probability_ready=pred_data["probability_ready"],
                probability_developing=pred_data["probability_developing"],
                probability_needs_prep=pred_data["probability_needs_prep"],
                strongest_areas=json.dumps(pred_data["strongest_areas"]),
                improvement_areas=json.dumps(pred_data["improvement_areas"]),
            )
            db.add(prediction)

            for rec in pred_data["recommendations"]:
                db.add(Recommendation(
                    user_id=demo_student.id,
                    assessment_id=assessment.id,
                    area=rec["area"],
                    reason=rec["reason"],
                    action=rec["action"],
                    priority=rec["priority"],
                    is_completed=False,
                ))
            db.commit()

        # Seed additional diverse sample students for the faculty dashboard analytics
        sample_students_data = [
            {
                "full_name": "Rohan Sharma",
                "email": "rohan.sharma@placepilot.edu",
                "reg_number": "2024CS0101",
                "department": "Computer Science & Engineering",
                "features": {
                    "cgpa": 9.2, "aptitude_score": 90.0, "technical_score": 88.0,
                    "communication_score": 82.0, "coding_score": 92.0, "projects_count": 4,
                    "internships_count": 2, "certifications_count": 3, "backlogs_count": 0,
                    "resume_readiness": 90.0, "interview_prep_level": "Advanced"
                }
            },
            {
                "full_name": "Priya Nair",
                "email": "priya.nair@placepilot.edu",
                "reg_number": "2024IT0215",
                "department": "Information Technology",
                "features": {
                    "cgpa": 7.8, "aptitude_score": 72.0, "technical_score": 70.0,
                    "communication_score": 75.0, "coding_score": 68.0, "projects_count": 2,
                    "internships_count": 1, "certifications_count": 2, "backlogs_count": 0,
                    "resume_readiness": 75.0, "interview_prep_level": "Intermediate"
                }
            },
            {
                "full_name": "Vikram Patel",
                "email": "vikram.patel@placepilot.edu",
                "reg_number": "2024EC0310",
                "department": "Electronics & Communication",
                "features": {
                    "cgpa": 6.4, "aptitude_score": 52.0, "technical_score": 55.0,
                    "communication_score": 58.0, "coding_score": 45.0, "projects_count": 1,
                    "internships_count": 0, "certifications_count": 1, "backlogs_count": 2,
                    "resume_readiness": 50.0, "interview_prep_level": "Beginner"
                }
            },
            {
                "full_name": "Ananya Roy",
                "email": "ananya.roy@placepilot.edu",
                "reg_number": "2024CS0188",
                "department": "Computer Science & Engineering",
                "features": {
                    "cgpa": 8.9, "aptitude_score": 85.0, "technical_score": 84.0,
                    "communication_score": 88.0, "coding_score": 80.0, "projects_count": 3,
                    "internships_count": 1, "certifications_count": 3, "backlogs_count": 0,
                    "resume_readiness": 88.0, "interview_prep_level": "Advanced"
                }
            },
            {
                "full_name": "Karthik Reddy",
                "email": "karthik.reddy@placepilot.edu",
                "reg_number": "2024ME0420",
                "department": "Mechanical Engineering",
                "features": {
                    "cgpa": 7.1, "aptitude_score": 62.0, "technical_score": 60.0,
                    "communication_score": 65.0, "coding_score": 50.0, "projects_count": 2,
                    "internships_count": 1, "certifications_count": 1, "backlogs_count": 0,
                    "resume_readiness": 65.0, "interview_prep_level": "Intermediate"
                }
            },
            {
                "full_name": "Sneha Gupta",
                "email": "sneha.gupta@placepilot.edu",
                "reg_number": "2024IT0290",
                "department": "Information Technology",
                "features": {
                    "cgpa": 5.8, "aptitude_score": 48.0, "technical_score": 45.0,
                    "communication_score": 50.0, "coding_score": 42.0, "projects_count": 1,
                    "internships_count": 0, "certifications_count": 0, "backlogs_count": 1,
                    "resume_readiness": 45.0, "interview_prep_level": "Beginner"
                }
            },
        ]

        for s_data in sample_students_data:
            existing = db.query(User).filter(User.email == s_data["email"]).first()
            if not existing:
                st = User(
                    email=s_data["email"],
                    hashed_password=hash_password("Student@123"),
                    full_name=s_data["full_name"],
                    role="student",
                    reg_number=s_data["reg_number"],
                    department=s_data["department"]
                )
                db.add(st)
                db.commit()
                db.refresh(st)

                feats = s_data["features"]
                profile = StudentProfile(
                    user_id=st.id,
                    degree="B.Tech",
                    current_year=4,
                    cgpa=feats["cgpa"],
                    aptitude_score=feats["aptitude_score"],
                    technical_score=feats["technical_score"],
                    communication_score=feats["communication_score"],
                    coding_score=feats["coding_score"],
                    projects_count=feats["projects_count"],
                    internships_count=feats["internships_count"],
                    certifications_count=feats["certifications_count"],
                    technical_skills="C++, Python, SQL, Web Dev",
                    backlogs_count=feats["backlogs_count"],
                    interview_prep_level=feats["interview_prep_level"],
                    resume_readiness=feats["resume_readiness"]
                )
                db.add(profile)

                assessment = Assessment(user_id=st.id, **feats)
                db.add(assessment)
                db.commit()
                db.refresh(assessment)

                pred_data = predict_placement_readiness(feats)
                prediction = Prediction(
                    assessment_id=assessment.id,
                    user_id=st.id,
                    readiness_category=pred_data["readiness_category"],
                    readiness_score=pred_data["readiness_score"],
                    probability_ready=pred_data["probability_ready"],
                    probability_developing=pred_data["probability_developing"],
                    probability_needs_prep=pred_data["probability_needs_prep"],
                    strongest_areas=json.dumps(pred_data["strongest_areas"]),
                    improvement_areas=json.dumps(pred_data["improvement_areas"]),
                )
                db.add(prediction)

                for rec in pred_data["recommendations"][:2]:
                    db.add(Recommendation(
                        user_id=st.id,
                        assessment_id=assessment.id,
                        area=rec["area"],
                        reason=rec["reason"],
                        action=rec["action"],
                        priority=rec["priority"],
                        is_completed=False,
                    ))
                db.commit()

        print("Database successfully seeded with demo accounts & sample student records.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
