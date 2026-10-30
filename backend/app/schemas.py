import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field

# ----------------- Auth Schemas -----------------
class UserRegister(BaseModel):
    email: str = Field(..., pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", description="Valid email address")
    password: str = Field(..., min_length=6, description="Minimum 6 characters")
    full_name: str = Field(..., min_length=2, max_length=255)
    role: str = Field(default="student", pattern="^(student|faculty)$")
    reg_number: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=150)

class UserLogin(BaseModel):
    email: str = Field(..., pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    reg_number: Optional[str] = None
    department: Optional[str] = None
    created_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    reg_number: Optional[str] = None
    department: Optional[str] = None

# ----------------- Profile Schemas -----------------
class StudentProfileBase(BaseModel):
    degree: str = Field(default="B.Tech", max_length=100)
    current_year: int = Field(default=4, ge=1, le=5)
    cgpa: float = Field(default=7.5, ge=0.0, le=10.0)
    aptitude_score: float = Field(default=70.0, ge=0.0, le=100.0)
    technical_score: float = Field(default=70.0, ge=0.0, le=100.0)
    communication_score: float = Field(default=70.0, ge=0.0, le=100.0)
    coding_score: float = Field(default=65.0, ge=0.0, le=100.0)
    projects_count: int = Field(default=2, ge=0, le=50)
    internships_count: int = Field(default=0, ge=0, le=20)
    certifications_count: int = Field(default=1, ge=0, le=50)
    technical_skills: str = Field(default="Python, SQL, Web Development")
    backlogs_count: int = Field(default=0, ge=0, le=20)
    interview_prep_level: str = Field(default="Intermediate")
    resume_readiness: float = Field(default=75.0, ge=0.0, le=100.0)

class StudentProfileUpdate(StudentProfileBase):
    pass

class StudentProfileResponse(StudentProfileBase):
    id: int
    user_id: int
    updated_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

# ----------------- Assessment & Prediction Schemas -----------------
class AssessmentCreate(BaseModel):
    cgpa: float = Field(..., ge=0.0, le=10.0, description="Cumulative Grade Point Average (0-10)")
    aptitude_score: float = Field(..., ge=0.0, le=100.0, description="Aptitude & quantitative score (0-100)")
    technical_score: float = Field(..., ge=0.0, le=100.0, description="Technical knowledge score (0-100)")
    communication_score: float = Field(..., ge=0.0, le=100.0, description="Communication & verbal score (0-100)")
    coding_score: float = Field(..., ge=0.0, le=100.0, description="Coding & problem-solving score (0-100)")
    projects_count: int = Field(..., ge=0, le=50, description="Number of completed projects")
    internships_count: int = Field(..., ge=0, le=20, description="Number of completed internships")
    certifications_count: int = Field(..., ge=0, le=50, description="Number of relevant certifications")
    backlogs_count: int = Field(..., ge=0, le=20, description="Active backlog count")
    resume_readiness: float = Field(..., ge=0.0, le=100.0, description="Self-evaluated resume readiness (0-100)")
    interview_prep_level: str = Field(..., description="Beginner, Intermediate, or Advanced")

class PredictionResponse(BaseModel):
    id: int
    assessment_id: int
    user_id: int
    readiness_category: str
    readiness_score: float
    probability_ready: float
    probability_developing: float
    probability_needs_prep: float
    strongest_areas: List[str]
    improvement_areas: List[str]
    created_at: datetime.datetime
    disclaimer: str = (
        "This readiness prediction is an AI model estimate based on institutional data patterns. "
        "It provides structured guidance for skill improvement and does not guarantee an actual hiring outcome."
    )

    class Config:
        from_attributes = True

class RecommendationResponse(BaseModel):
    id: int
    user_id: int
    assessment_id: Optional[int] = None
    area: str
    reason: str
    action: str
    priority: str
    is_completed: bool
    completed_at: Optional[datetime.datetime] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class RecommendationUpdate(BaseModel):
    is_completed: bool

class AssessmentResponse(BaseModel):
    id: int
    user_id: int
    cgpa: float
    aptitude_score: float
    technical_score: float
    communication_score: float
    coding_score: float
    projects_count: int
    internships_count: int
    certifications_count: int
    backlogs_count: int
    resume_readiness: float
    interview_prep_level: str
    created_at: datetime.datetime
    prediction: Optional[PredictionResponse] = None
    recommendations: List[RecommendationResponse] = []

    class Config:
        from_attributes = True

class AssessmentWithResultResponse(BaseModel):
    assessment: AssessmentResponse
    prediction: PredictionResponse
    recommendations: List[RecommendationResponse]

# ----------------- Student Dashboard Summary -----------------
class StudentDashboardSummary(BaseModel):
    user: UserResponse
    profile: Optional[StudentProfileResponse] = None
    latest_assessment: Optional[AssessmentResponse] = None
    latest_prediction: Optional[PredictionResponse] = None
    recommendations: List[RecommendationResponse] = []
    assessment_count: int = 0
    completed_recommendations_count: int = 0
    total_recommendations_count: int = 0

# ----------------- Admin / Faculty Schemas -----------------
class ReadinessDistribution(BaseModel):
    placement_ready: int = 0
    developing: int = 0
    needs_preparation: int = 0

class DepartmentStats(BaseModel):
    department: str
    student_count: int
    assessed_count: int
    avg_cgpa: float
    placement_ready_count: int

class AdminStatsResponse(BaseModel):
    total_students: int
    assessed_students: int
    unassessed_students: int
    total_assessments: int
    avg_cgpa: float
    avg_technical_score: float
    avg_coding_score: float
    avg_aptitude_score: float
    readiness_distribution: ReadinessDistribution
    department_summary: List[DepartmentStats]

class StudentListItemResponse(BaseModel):
    id: int
    full_name: str
    email: str
    reg_number: Optional[str] = None
    department: Optional[str] = None
    created_at: datetime.datetime
    has_profile: bool
    cgpa: Optional[float] = None
    assessments_count: int
    latest_readiness_category: Optional[str] = None
    latest_readiness_score: Optional[float] = None
    latest_assessment_date: Optional[datetime.datetime] = None

class StudentDetailResponse(BaseModel):
    user: UserResponse
    profile: Optional[StudentProfileResponse] = None
    assessments: List[AssessmentResponse] = []
    recommendations: List[RecommendationResponse] = []
