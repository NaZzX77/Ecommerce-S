from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.jwt import create_access_token
from app.database.session import get_db
from app.models.user import User
from app.schemas.auth import Token, UserCreate, UserLogin, UserRead
from app.services.user_service import authenticate_user, create_user, get_user_by_email


router = APIRouter(prefix="/auth")


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(
    user_data: UserCreate,
    db: Annotated[Session, Depends(get_db)],
) -> User:
    existing_user = get_user_by_email(db, email=user_data.email)
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    return create_user(db, user_data)


@router.post("/login", response_model=Token)
def login_user(
    credentials: UserLogin,
    db: Annotated[Session, Depends(get_db)],
) -> Token:
    user = authenticate_user(db, email=credentials.email, password=credentials.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    return Token(access_token=create_access_token(subject=user.email), user=user)


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    return current_user

