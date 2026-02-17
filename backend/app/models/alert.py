from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON, ForeignKey, Text
from sqlalchemy.sql import func
from app.db.base import Base


class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False, index=True)
    alert_type = Column(String(50), nullable=False, index=True)
    
    # Links to entities
    shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    inventory_id = Column(Integer, ForeignKey("inventory.id"), nullable=True)
    
    # Generic entity linking
    entity_type = Column(String(50), nullable=True)
    entity_id = Column(Integer, nullable=True)
    
    # Changed from 'metadata' to 'alert_metadata' (metadata is reserved)
    alert_metadata = Column(JSON, nullable=True)
    
    # Resolution tracking
    resolved = Column(Boolean, default=False, index=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    resolution_notes = Column(String, nullable=True)
    
    # Notification tracking
    is_sent = Column(Boolean, default=False)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    recipients = Column(JSON, nullable=True)
    extra_data = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Alert(id={self.id}, severity={self.severity}, type={self.alert_type}, resolved={self.resolved})>"