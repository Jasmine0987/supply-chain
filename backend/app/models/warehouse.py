"""
Warehouse Model
Stores warehouse/distribution center information
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Warehouse(Base):
    __tablename__ = "warehouses"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=True)
    country = Column(String, nullable=False)
    postal_code = Column(String, nullable=True)
    
    # GPS coordinates
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Capacity
    total_capacity = Column(Integer, default=0)  # Square meters or pallets
    current_utilization = Column(Integer, default=0)
    
    # Status
    is_active = Column(Boolean, default=True)
    warehouse_type = Column(String, default="distribution")  # distribution, fulfillment, cold_storage
    
    # Contact info
    manager_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    
    # Additional metadata
    extra_data = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    forecasts = relationship("Forecast",back_populates="warehouse",cascade="all, delete-orphan")
    def __repr__(self):
        return f"<Warehouse {self.code}: {self.name}>"