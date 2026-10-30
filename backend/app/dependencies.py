from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.auth import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    token_data = decode_access_token(token)
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def get_current_student(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to student accounts"
        )
    return current_user

def get_current_faculty(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.role != "faculty":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to authorized faculty and administrative accounts"
        )
    return current_user
