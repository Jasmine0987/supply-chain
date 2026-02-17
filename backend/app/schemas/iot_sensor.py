from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class IoTSensorBase(BaseModel):
    device_id: str
    name: str
    sensor_type: str
    warehouse_id: Optional[int] = None
    shipment_id: Optional[int] = None
    location_description: Optional[str] = None
    is_active: Optional[bool] = True
    battery_level: Optional[float] = None
    signal_strength: Optional[float] = None
    min_threshold: Optional[float] = None
    max_threshold: Optional[float] = None
    firmware_version: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None


class IoTSensorCreate(IoTSensorBase):
    pass


class IoTSensorUpdate(BaseModel):
    device_id: Optional[str] = None
    name: Optional[str] = None
    sensor_type: Optional[str] = None
    warehouse_id: Optional[int] = None
    shipment_id: Optional[int] = None
    location_description: Optional[str] = None
    is_active: Optional[bool] = None
    battery_level: Optional[float] = None
    signal_strength: Optional[float] = None
    min_threshold: Optional[float] = None
    max_threshold: Optional[float] = None
    firmware_version: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None


class IoTSensor(IoTSensorBase):
    id: int
    last_reading: Optional[dict] = None
    last_reading_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)