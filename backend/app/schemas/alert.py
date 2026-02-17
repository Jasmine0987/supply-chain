from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional


# Base Alert schema
class AlertBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1, max_length=1000)
    severity: str  # critical, high, medium, low
    alert_type: str  # delay, stock low, temperature, etc.
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    alert_metadata: Optional[dict] = None


# Schema for creating an alert
class AlertCreate(AlertBase):
    shipment_id: Optional[int] = None
    warehouse_id: Optional[int] = None
    inventory_id: Optional[int] = None


# Schema for updating an alert
class AlertUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    message: Optional[str] = Field(None, min_length=1, max_length=1000)
    severity: Optional[str] = None
    alert_type: Optional[str] = None
    resolved: Optional[bool] = None
    alert_metadata: Optional[dict] = None


# Schema for alert in database (with ID and timestamps)
class Alert(AlertBase):
    id: int
    resolved: Optional[bool] = False
    created_at: datetime
    resolved_at: Optional[datetime] = None
    shipment_id: Optional[int] = None
    warehouse_id: Optional[int] = None
    inventory_id: Optional[int] = None
    
    model_config = ConfigDict(from_attributes=True)


# Schema for alert list response
class AlertList(BaseModel):
    total: int
    unresolved: int
    alerts: list[Alert]


# Schema for alert statistics
class AlertStats(BaseModel):
    total: int
    unresolved: int
    critical: int
    high: int
    medium: int
    low: int
    by_type: dict[str, int]