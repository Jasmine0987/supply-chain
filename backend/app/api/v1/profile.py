from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.core.security import verify_password, get_password_hash

router = APIRouter()


# =========================
# Schemas
# =========================

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


class NotificationPreferences(BaseModel):
    email_alerts: bool = True
    email_reports: bool = True
    email_updates: bool = False
    browser_notifications: bool = True
    alert_sound: bool = False
    critical_only: bool = False


# =========================
# Routes
# =========================

@router.get("/profile")
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    preferences = NotificationPreferences()

    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "role": current_user.role,
            "phone": getattr(current_user, "phone", None),
            "department": getattr(current_user, "department", None),
            "avatar_url": getattr(current_user, "avatar_url", None),
        },
        "preferences": preferences.dict(),
    }


@router.put("/profile")
def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if profile_data.full_name:
        current_user.full_name = profile_data.full_name
    if profile_data.phone:
        current_user.phone = profile_data.phone
    if profile_data.department:
        current_user.department = profile_data.department

    db.commit()
    db.refresh(current_user)

    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "phone": getattr(current_user, "phone", None),
        "department": getattr(current_user, "department", None),
    }


@router.post("/profile/change-password")
def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(
        password_data.current_password,
        current_user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    if len(password_data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long",
        )

    current_user.hashed_password = get_password_hash(
        password_data.new_password
    )
    db.commit()

    return {"message": "Password changed successfully"}


@router.put("/profile/preferences")
def update_preferences(
    preferences: NotificationPreferences,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return preferences.dict()
