from typing import Annotated

from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.models.user import User


router = APIRouter(prefix="/protected")


@router.get("/dashboard")
def read_protected_dashboard(current_user: Annotated[User, Depends(get_current_user)]) -> dict[str, str]:
    return {
        "message": f"Welcome back, {current_user.full_name}.",
        "email": current_user.email,
    }

