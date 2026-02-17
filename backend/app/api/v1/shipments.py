"""
Shipment tracking endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.shipment import Shipment
from app.models.user import User

router = APIRouter()

@router.get("/")
def get_shipments(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all shipments with optional status filter
    """
    query = db.query(Shipment)
    
    if status:
        query = query.filter(Shipment.status == status)
    
    shipments = query.offset(skip).limit(limit).all()
    return shipments

@router.get("/{shipment_id}")
def get_shipment(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get shipment by ID
    """
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return shipment

@router.get("/tracking/{tracking_number}")
def get_shipment_by_tracking(
    tracking_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get shipment by tracking number
    """
    shipment = db.query(Shipment).filter(
        Shipment.tracking_number == tracking_number
    ).first()
    
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    return shipment