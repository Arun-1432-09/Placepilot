import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, StudentProfile
from app.schemas import UserRegister, UserLogin, Token, UserResponse, UserUpdate
from app.auth import hash_password, verify_password, create_access_token
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new student or faculty account."""
    existing_user = db.query(User).filter(User.email == user_data.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Clean and validate role
    role = user_data.role.lower()
    if role not in ["student", "faculty"]:
        role = "student"

    hashed_pw = hash_password(user_data.password)
    user = User(
        email=user_data.email.lower(),
        hashed_password=hashed_pw,
        full_name=user_data.full_name.strip(),
        role=role,
        reg_number=user_data.reg_number.strip() if user_data.reg_number else None,
        department=user_data.department.strip() if user_data.department else None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize empty profile for students
    if user.role == "student":
        profile = StudentProfile(
            user_id=user.id,
            degree="B.Tech",
            current_year=4,
            cgpa=7.5,
            aptitude_score=70.0,
            technical_score=70.0,
            communication_score=70.0,
            coding_score=65.0,
            projects_count=2,
            internships_count=0,
            certifications_count=1,
            technical_skills="Python, SQL, Web Development",
            backlogs_count=0,
            interview_prep_level="Intermediate",
            resume_readiness=75.0,
        )
        db.add(profile)
        db.commit()

    return user

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate with email and password, returning a JWT token."""
    user = db.query(User).filter(User.email == login_data.email.lower()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2 password form login endpoint for Swagger UI documentation."""
    user = db.query(User).filter(User.email == form_data.username.lower()).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Fetch details of the currently authenticated user."""
    return current_user

@router.put("/me", response_model=UserResponse)
def update_user_info(
    updates: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update personal profile details (name, reg number, department)."""
    if updates.full_name is not None and updates.full_name.strip():
        current_user.full_name = updates.full_name.strip()
    if updates.reg_number is not None:
        current_user.reg_number = updates.reg_number.strip()
    if updates.department is not None:
        current_user.department = updates.department.strip()

    db.commit()
    db.refresh(current_user)
    return current_user
