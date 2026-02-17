"""
User management endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_current_admin_user
from app.db.session import get_db
from app.models.user import User

router = APIRouter()

@router.get("/me")
def read_users_me(current_user: User = Depends(get_current_active_user)):
    """
    Get current user
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "is_superuser": current_user.is_superuser
    }

@router.get("/")
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Retrieve users (admin only)
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users