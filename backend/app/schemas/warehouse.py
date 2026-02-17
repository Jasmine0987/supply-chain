from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class WarehouseBase(BaseModel):
    name: str
    code: str
    address: str
    city: str
    state: Optional[str] = None
    country: str
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    total_capacity: Optional[int] = 0
    current_utilization: Optional[int] = 0
    is_active: Optional[bool] = True
    warehouse_type: Optional[str] = "distribution"
    manager_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class WarehouseCreate(WarehouseBase):
    pass


class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    total_capacity: Optional[int] = None
    current_utilization: Optional[int] = None
    is_active: Optional[bool] = None
    warehouse_type: Optional[str] = None
    manager_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class Warehouse(WarehouseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)