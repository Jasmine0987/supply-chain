"""
Carrier Model
Stores shipping carrier information (FedEx, UPS, DHL, etc.)
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, JSON
from sqlalchemy.sql import func
from app.db.base import Base

class Carrier(Base):
    __tablename__ = "carriers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)  # FEDEX, UPS, DHL
    
    # Service details
    service_type = Column(String, nullable=True)  # express, ground, freight
    is_active = Column(Boolean, default=True)
    
    # Performance metrics
    on_time_delivery_rate = Column(Float, default=0.0)  # Percentage
    average_delivery_days = Column(Float, default=0.0)
    total_shipments = Column(Integer, default=0)
    
    # Contact & API info
    api_endpoint = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    
    # Additional settings
    extra_data = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Carrier {self.code}: {self.name}>"