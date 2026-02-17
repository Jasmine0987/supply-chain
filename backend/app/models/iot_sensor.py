"""
IoT Sensor Model
Stores IoT sensor device information
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class IoTSensor(Base):
    __tablename__ = "iot_sensors"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    
    # Sensor type
    sensor_type = Column(String, nullable=False)  # temperature, humidity, gps, shock, door
    
    # Location
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=True)
    location_description = Column(String, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    battery_level = Column(Float, nullable=True)  # Percentage
    signal_strength = Column(Float, nullable=True)  # RSSI or percentage
    
    # Latest reading
    last_reading = Column(JSON, nullable=True)  # Latest sensor data
    last_reading_at = Column(DateTime(timezone=True), nullable=True)
    
    # Thresholds for alerts
    min_threshold = Column(Float, nullable=True)
    max_threshold = Column(Float, nullable=True)
    
    # Device info
    firmware_version = Column(String, nullable=True)
    manufacturer = Column(String, nullable=True)
    model = Column(String, nullable=True)
    
    # Additional metadata
    extra_data = Column(JSON, nullable=True)
    
    # Relationships
    warehouse = relationship("Warehouse", foreign_keys=[warehouse_id])
    shipment = relationship("Shipment", foreign_keys=[shipment_id])
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<IoTSensor {self.device_id}: {self.sensor_type}>"