from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.password import hash_password, verify_password
from app.models.user import User
from app.schemas.auth import UserCreate


def get_user_by_email(db: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email.lower())
    return db.scalar(statement)


def create_user(db: Session, user_data: UserCreate) -> User:
    user = User(
        email=user_data.email.lower(),
        full_name=user_data.full_name.strip(),
        hashed_password=hash_password(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email=email)
    if user is None:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user

