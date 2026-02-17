"""
Shipment Model
Tracks shipments/packages in transit
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Shipment(Base):
    __tablename__ = "shipments"
    
    id = Column(Integer, primary_key=True, index=True)
    tracking_number = Column(String, unique=True, index=True, nullable=False)
    
    # References
    carrier_id = Column(Integer, ForeignKey("carriers.id"), nullable=True)
    origin_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    destination_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    
    # Status
    status = Column(String, default="pending")  # pending, in_transit, delivered, exception
    priority = Column(String, default="normal")  # low, normal, high, urgent
    
    # Locations
    current_location = Column(String, nullable=True)
    current_latitude = Column(Float, nullable=True)
    current_longitude = Column(Float, nullable=True)
    
    # Addresses
    origin_address = Column(String, nullable=True)
    destination_address = Column(String, nullable=True)
    
    # Timing
    estimated_delivery = Column(DateTime(timezone=True), nullable=True)
    actual_delivery = Column(DateTime(timezone=True), nullable=True)
    shipped_at = Column(DateTime(timezone=True), nullable=True)
    
    # Package details
    weight = Column(Float, default=0.0)  # kg
    dimensions = Column(JSON, nullable=True)  # {"length": 10, "width": 20, "height": 30}
    package_type = Column(String, default="box")  # box, pallet, envelope
    
    # Cost
    shipping_cost = Column(Float, default=0.0)
    
    # Additional info
    notes = Column(String, nullable=True)
    extra_data = Column(JSON, nullable=True)
    
    # Relationships
    carrier = relationship("Carrier", foreign_keys=[carrier_id])
    origin_warehouse = relationship("Warehouse", foreign_keys=[origin_warehouse_id])
    destination_warehouse = relationship("Warehouse", foreign_keys=[destination_warehouse_id])
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Shipment {self.tracking_number}: {self.status}>"