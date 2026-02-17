
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.inventory import Inventory
from app.models.user import User
from pydantic import BaseModel

router = APIRouter()

class InventoryResponse(BaseModel):
    id: int
    sku: str
    product_name: str  # Frontend expects this
    category: str
    quantity_available: int
    quantity_reserved: int
    quantity_incoming: int
    unit_price: float
    warehouse_id: int
    
    class Config:
        from_attributes = True

@router.get("/")
def get_inventory(
    skip: int = 0,
    limit: int = 100,
    warehouse_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get all inventory items
    """
    query = db.query(Inventory)
    
    if warehouse_id:
        query = query.filter(Inventory.warehouse_id == warehouse_id)
    
    items = query.offset(skip).limit(limit).all()
    print(f"[Inventory API] Returned {len(items)} items")  # debug log
    result: List[InventoryResponse] = []
    for item in items:
        result.append(
            InventoryResponse(
                id=item.id,
                sku=item.sku,
                product_name=item.name,   # ✅ map DB `name` → frontend `product_name`
                category=item.category,
                quantity_available=item.quantity_available,
                quantity_reserved=item.quantity_reserved,
                quantity_incoming=item.quantity_incoming,
                unit_price=float(item.unit_price) if item.unit_price else 0.0,
                warehouse_id=item.warehouse_id,
            )
        )
    return result

@router.get("/{item_id}", response_model=InventoryResponse)
def get_inventory_item(
    item_id: int,
    db: Session = Depends(get_db)
):
    """
    Get inventory item by ID
    """
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return InventoryResponse(
        id=item.id,
        sku=item.sku,
        product_name=item.name,
        category=item.category,
        quantity_available=item.quantity_available,
        quantity_reserved=item.quantity_reserved,
        quantity_incoming=item.quantity_incoming,
        unit_price=float(item.unit_price) if item.unit_price else 0.0,
        warehouse_id=item.warehouse_id,
    )

@router.get("/sku/{sku}", response_model=InventoryResponse)
def get_inventory_by_sku(
    sku: str,
    db: Session = Depends(get_db)
):
    """
    Get inventory item by SKU
    """
    item = db.query(Inventory).filter(Inventory.sku == sku).first()
    if not item:
        raise HTTPException(status_code=404, detail="SKU not found")
    return InventoryResponse(
        id=item.id,
        sku=item.sku,
        product_name=item.name,
        category=item.category,
        quantity_available=item.quantity_available,
        quantity_reserved=item.quantity_reserved,
        quantity_incoming=item.quantity_incoming,
        unit_price=float(item.unit_price) if item.unit_price else 0.0,
        warehouse_id=item.warehouse_id,
    )