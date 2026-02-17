"""
Carrier management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.carrier import Carrier
from app.models.user import User

router = APIRouter()

@router.get("/")
def get_carriers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all carriers
    """
    carriers = db.query(Carrier).offset(skip).limit(limit).all()
    return carriers

@router.get("/{carrier_id}")
def get_carrier(
    carrier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get carrier by ID
    """
    carrier = db.query(Carrier).filter(Carrier.id == carrier_id).first()
    if not carrier:
        raise HTTPException(status_code=404, detail="Carrier not found")
    return carrier