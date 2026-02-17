from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base import Base


class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)
    
    # Forecast metadata
    forecast_type = Column(String(50))  # demand, shipment_volume, cost
    model_type = Column(String(50))  # prophet, arima, lstm, ensemble
    product_sku = Column(String(100), nullable=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    
    # Time period
    forecast_date = Column(DateTime)
    forecast_horizon = Column(Integer)  # Days ahead
    
    # Predictions
    predicted_value = Column(Float)
    lower_bound = Column(Float)  # Confidence interval lower
    upper_bound = Column(Float)  # Confidence interval upper
    confidence = Column(Float)  # 0-1 confidence score
    
    # Actual value (for validation)
    actual_value = Column(Float, nullable=True)
    
    # Model metrics
    model_accuracy = Column(Float, nullable=True)  # MAPE, RMSE, etc.
    model_version = Column(String(50))
    training_date = Column(DateTime, default=datetime.utcnow)
    
    # Additional metadata
    meta_data = Column(JSON, default={})
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    warehouse = relationship("Warehouse", back_populates="forecasts")


# Add to Warehouse model
# In backend/app/models/warehouse.py, add:
# forecasts = relationship("Forecast", back_populates="warehouse")