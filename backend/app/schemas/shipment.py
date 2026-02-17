from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class ShipmentBase(BaseModel):
    tracking_number: str
    carrier_id: Optional[int] = None
    origin_warehouse_id: Optional[int] = None
    destination_warehouse_id: Optional[int] = None
    status: Optional[str] = "pending"
    priority: Optional[str] = "normal"
    current_location: Optional[str] = None
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    origin_address: Optional[str] = None
    destination_address: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    weight: Optional[float] = 0.0
    package_type: Optional[str] = "box"
    shipping_cost: Optional[float] = 0.0
    notes: Optional[str] = None


class ShipmentCreate(ShipmentBase):
    pass


class ShipmentUpdate(BaseModel):
    tracking_number: Optional[str] = None
    carrier_id: Optional[int] = None
    origin_warehouse_id: Optional[int] = None
    destination_warehouse_id: Optional[int] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    current_location: Optional[str] = None
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    origin_address: Optional[str] = None
    destination_address: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    actual_delivery: Optional[datetime] = None
    weight: Optional[float] = None
    package_type: Optional[str] = None
    shipping_cost: Optional[float] = None
    notes: Optional[str] = None


class Shipment(ShipmentBase):
    id: int
    actual_delivery: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)