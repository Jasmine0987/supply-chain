from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class CarrierBase(BaseModel):
    name: str
    code: str
    service_type: Optional[str] = None
    is_active: Optional[bool] = True
    on_time_delivery_rate: Optional[float] = 0.0
    average_delivery_days: Optional[float] = 0.0
    total_shipments: Optional[int] = 0
    api_endpoint: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


class CarrierCreate(CarrierBase):
    pass


class CarrierUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    service_type: Optional[str] = None
    is_active: Optional[bool] = None
    on_time_delivery_rate: Optional[float] = None
    average_delivery_days: Optional[float] = None
    total_shipments: Optional[int] = None
    api_endpoint: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


class Carrier(CarrierBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)