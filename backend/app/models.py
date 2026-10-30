import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student", nullable=False)  # "student" or "faculty"
    reg_number = Column(String(100), index=True, nullable=True)   # USN / Roll number
    department = Column(String(150), nullable=True)               # e.g., "Computer Science & Engineering"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Relationships
    profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="user", cascade="all, delete-orphan", order_by="desc(Assessment.created_at)")
    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan", order_by="desc(Prediction.created_at)")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan", order_by="desc(Recommendation.created_at)")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    degree = Column(String(100), default="B.Tech")
    current_year = Column(Integer, default=4)
    cgpa = Column(Float, default=7.5)
    aptitude_score = Column(Float, default=70.0)
    technical_score = Column(Float, default=70.0)
    communication_score = Column(Float, default=70.0)
    coding_score = Column(Float, default=65.0)
    projects_count = Column(Integer, default=2)
    internships_count = Column(Integer, default=0)
    certifications_count = Column(Integer, default=1)
    technical_skills = Column(Text, default="Python, SQL, Data Structures, Web Development")
    backlogs_count = Column(Integer, default=0)
    interview_prep_level = Column(String(50), default="Intermediate")
    resume_readiness = Column(Float, default=75.0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="profile")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    cgpa = Column(Float, nullable=False)
    aptitude_score = Column(Float, nullable=False)
    technical_score = Column(Float, nullable=False)
    communication_score = Column(Float, nullable=False)
    coding_score = Column(Float, nullable=False)
    projects_count = Column(Integer, nullable=False)
    internships_count = Column(Integer, nullable=False)
    certifications_count = Column(Integer, nullable=False)
    backlogs_count = Column(Integer, nullable=False)
    resume_readiness = Column(Float, nullable=False)
    interview_prep_level = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="assessments")
    prediction = relationship("Prediction", back_populates="assessment", uselist=False, cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="assessment", cascade="all, delete-orphan")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    readiness_category = Column(String(50), nullable=False)  # "Placement Ready", "Developing", "Needs Preparation"
    readiness_score = Column(Float, nullable=False)          # 0 - 100 percentage
    probability_ready = Column(Float, nullable=False)
    probability_developing = Column(Float, nullable=False)
    probability_needs_prep = Column(Float, nullable=False)
    strongest_areas = Column(Text, nullable=False)           # JSON string list
    improvement_areas = Column(Text, nullable=False)         # JSON string list
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    assessment = relationship("Assessment", back_populates="prediction")
    user = relationship("User", back_populates="predictions")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=True)
    area = Column(String(100), nullable=False)
    reason = Column(Text, nullable=False)
    action = Column(Text, nullable=False)
    priority = Column(String(20), nullable=False)            # "High", "Medium", "Low"
    is_completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="recommendations")
    assessment = relationship("Assessment", back_populates="recommendations")
