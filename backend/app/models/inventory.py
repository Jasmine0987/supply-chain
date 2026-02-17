"""
Inventory Model
Tracks inventory items in warehouses
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Inventory(Base):
    __tablename__ = "inventory"
    
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, index=True, nullable=False)
    name = Column(String, nullable=False)
    
    # Warehouse location
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    location_code = Column(String, nullable=True)  # Aisle-Rack-Shelf (e.g., "A-12-3")
    
    # Quantity
    quantity_available = Column(Integer, default=0)
    quantity_reserved = Column(Integer, default=0)
    quantity_incoming = Column(Integer, default=0)
    reorder_point = Column(Integer, default=10)
    reorder_quantity = Column(Integer, default=50)
    
    # Product details
    category = Column(String, nullable=True)
    unit_cost = Column(Float, default=0.0)
    unit_price = Column(Float, default=0.0)
    weight = Column(Float, default=0.0)  # kg per unit
    
    # Storage requirements
    requires_refrigeration = Column(Boolean, default=False)
    is_hazardous = Column(Boolean, default=False)
    is_fragile = Column(Boolean, default=False)
    
    # Tracking
    last_counted = Column(DateTime(timezone=True), nullable=True)
    last_restocked = Column(DateTime(timezone=True), nullable=True)
    
    # Additional metadata
    extra_data = Column(JSON, nullable=True)
    
    # Relationships
    warehouse = relationship("Warehouse", foreign_keys=[warehouse_id])
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Inventory {self.sku}: {self.name} ({self.quantity_available} available)>"