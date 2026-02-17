from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class InventoryBase(BaseModel):
    sku: str
    name: str
    warehouse_id: int
    location_code: Optional[str] = None
    quantity_available: Optional[int] = 0
    quantity_reserved: Optional[int] = 0
    quantity_incoming: Optional[int] = 0
    reorder_point: Optional[int] = 10
    reorder_quantity: Optional[int] = 50
    category: Optional[str] = None
    unit_cost: Optional[float] = 0.0
    unit_price: Optional[float] = 0.0
    weight: Optional[float] = 0.0
    requires_refrigeration: Optional[bool] = False
    is_hazardous: Optional[bool] = False
    is_fragile: Optional[bool] = False


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(BaseModel):
    sku: Optional[str] = None
    name: Optional[str] = None
    warehouse_id: Optional[int] = None
    location_code: Optional[str] = None
    quantity_available: Optional[int] = None
    quantity_reserved: Optional[int] = None
    quantity_incoming: Optional[int] = None
    reorder_point: Optional[int] = None
    reorder_quantity: Optional[int] = None
    category: Optional[str] = None
    unit_cost: Optional[float] = None
    unit_price: Optional[float] = None
    weight: Optional[float] = None
    requires_refrigeration: Optional[bool] = None
    is_hazardous: Optional[bool] = None
    is_fragile: Optional[bool] = None


class Inventory(InventoryBase):
    id: int
    last_counted: Optional[datetime] = None
    last_restocked: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)