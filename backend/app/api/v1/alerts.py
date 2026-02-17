from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from datetime import datetime

from app.api import deps
from app import models, schemas

router = APIRouter()


@router.get("/", response_model=List[schemas.Alert])
async def get_alerts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    severity: Optional[str] = Query(None),
    resolved: Optional[bool] = Query(None),
    alert_type: Optional[str] = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Get all alerts with optional filters
    """
    query = db.query(models.Alert)
    
    if severity:
        query = query.filter(models.Alert.severity == severity)
    
    if resolved is not None:
        query = query.filter(models.Alert.resolved == resolved)
    
    if alert_type:
        query = query.filter(models.Alert.alert_type == alert_type)
    
    query = query.order_by(desc(models.Alert.created_at))
    alerts = query.offset(skip).limit(limit).all()
    
    return alerts


@router.get("/stats", response_model=schemas.AlertStats)
async def get_alert_stats(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Get alert statistics"""
    
    total = db.query(models.Alert).count()
    unresolved = db.query(models.Alert).filter(models.Alert.resolved == False).count()
    
    critical = db.query(models.Alert).filter(
        models.Alert.severity == "critical",
        models.Alert.resolved == False
    ).count()
    
    high = db.query(models.Alert).filter(
        models.Alert.severity == "high",
        models.Alert.resolved == False
    ).count()
    
    medium = db.query(models.Alert).filter(
        models.Alert.severity == "medium",
        models.Alert.resolved == False
    ).count()
    
    low = db.query(models.Alert).filter(
        models.Alert.severity == "low",
        models.Alert.resolved == False
    ).count()
    
    type_counts = db.query(
        models.Alert.alert_type,
        func.count(models.Alert.id).label('count')
    ).filter(
        models.Alert.resolved == False
    ).group_by(models.Alert.alert_type).all()
    
    by_type = {alert_type: count for alert_type, count in type_counts}
    
    return schemas.AlertStats(
        total=total,
        unresolved=unresolved,
        critical=critical,
        high=high,
        medium=medium,
        low=low,
        by_type=by_type
    )


@router.get("/{alert_id}", response_model=schemas.Alert)
async def get_alert(
    alert_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Get a specific alert by ID"""
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return alert


@router.post("/", response_model=schemas.Alert, status_code=201)
async def create_alert(
    alert: schemas.AlertCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Create a new alert"""
    db_alert = models.Alert(**alert.model_dump())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    
    return db_alert


@router.patch("/{alert_id}/resolve", response_model=schemas.Alert)
async def resolve_alert(
    alert_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Mark an alert as resolved"""
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    if alert.resolved:
        raise HTTPException(status_code=400, detail="Alert is already resolved")
    
    alert.resolved = True
    alert.resolved_at = datetime.utcnow()
    alert.resolved_by = current_user.id
    db.commit()
    db.refresh(alert)
    
    return alert


@router.patch("/{alert_id}", response_model=schemas.Alert)
async def update_alert(
    alert_id: int,
    alert_update: schemas.AlertUpdate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Update an alert"""
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    update_data = alert_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(alert, field, value)
    
    if update_data.get('resolved') and not alert.resolved_at:
        alert.resolved_at = datetime.utcnow()
        alert.resolved_by = current_user.id
    
    db.commit()
    db.refresh(alert)
    
    return alert


@router.delete("/{alert_id}", status_code=204)
async def delete_alert(
    alert_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Delete an alert"""
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    db.delete(alert)
    db.commit()
    
    return None


@router.post("/bulk-resolve", response_model=dict)
async def bulk_resolve_alerts(
    alert_ids: List[int],
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Resolve multiple alerts at once"""
    alerts = db.query(models.Alert).filter(
        models.Alert.id.in_(alert_ids),
        models.Alert.resolved == False
    ).all()
    
    if not alerts:
        raise HTTPException(
            status_code=404,
            detail="No unresolved alerts found with provided IDs"
        )
    
    resolved_count = 0
    for alert in alerts:
        alert.resolved = True
        alert.resolved_at = datetime.utcnow()
        alert.resolved_by = current_user.id
        resolved_count += 1
    
    db.commit()
    
    return {
        "message": f"Successfully resolved {resolved_count} alerts",
        "resolved_count": resolved_count
    }