"""
IoT sensor management endpoints
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import random
from datetime import datetime
from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.iot_sensor import IoTSensor
from app.models.user import User

router = APIRouter()

@router.get("/")
def get_sensors(
    skip: int = 0,
    limit: int = 100,
    sensor_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all IoT sensors
    """
    query = db.query(IoTSensor)
    
    if sensor_type:
        query = query.filter(IoTSensor.sensor_type == sensor_type)
    
    if is_active is not None:
        query = query.filter(IoTSensor.is_active == is_active)
    
    sensors = query.offset(skip).limit(limit).all()
    return sensors

@router.get("/{sensor_id}")
def get_sensor(
    sensor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get sensor by ID
    """
    sensor = db.query(IoTSensor).filter(IoTSensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return sensor

@router.get("/sensors/live")
async def get_live_sensors():
    """Get simulated live sensor data"""
    
    sensors = [
        {
            "id": "SENSOR-CHI-DC-01-TEMP-001",
            "type": "TEMPERATURE",
            "value": 20 + random.uniform(0, 10),
            "unit": "°C",
            "battery": 85 + random.uniform(0, 15),
            "status": "normal",
            "last_update": datetime.now().isoformat()
        },
        {
            "id": "SENSOR-CHI-DC-01-HUM-001",
            "type": "HUMIDITY",
            "value": 40 + random.uniform(0, 30),
            "unit": "%",
            "battery": 90 + random.uniform(0, 10),
            "status": "normal",
            "last_update": datetime.now().isoformat()
        },
        {
            "id": "SENSOR-LA-FC-01-TEMP-001",
            "type": "TEMPERATURE",
            "value": 20 + random.uniform(0, 8),
            "unit": "°C",
            "battery": 85 + random.uniform(0, 15),
            "status": "normal",
            "last_update": datetime.now().isoformat()
        },
        {
            "id": "SENSOR-NY-CS-01-TEMP-001",
            "type": "TEMPERATURE",
            "value": 2 + random.uniform(0, 8),
            "unit": "°C",
            "battery": 80 + random.uniform(0, 20),
            "status": "normal",
            "last_update": datetime.now().isoformat()
        },
        {
            "id": "SENSOR-SHIP-001-GPS",
            "type": "GPS",
            "value": 41.88,
            "unit": "lat",
            "battery": 90 + random.uniform(0, 10),
            "status": "normal",
            "last_update": datetime.now().isoformat()
        },
    ]
    
    return {
        "sensors": sensors,
        "connected": True,
        "timestamp": datetime.now().isoformat()
    }