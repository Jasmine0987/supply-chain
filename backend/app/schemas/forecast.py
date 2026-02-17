from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List, Dict, Any


class ForecastBase(BaseModel):
    forecast_type: str = Field(..., description="Type: demand, shipment_volume, cost")
    product_sku: Optional[str] = None
    warehouse_id: Optional[int] = None


class ForecastCreate(ForecastBase):
    model_type: str = Field(default="ensemble", description="prophet, arima, or ensemble")
    forecast_horizon: int = Field(default=30, ge=1, le=365)


class ForecastResponse(ForecastBase):
    id: int
    forecast_date: datetime
    predicted_value: float
    lower_bound: float
    upper_bound: float
    confidence: float
    model_accuracy: Optional[float]
    model_version: str
    created_at: datetime
        
    model_config = ConfigDict(from_attributes=True)


class ForecastSeries(BaseModel):
    """Time series forecast response"""
    forecast_type: str
    model_type: str
    product_sku: Optional[str]
    warehouse_id: Optional[int]
    predictions: List[Dict[str, Any]]
    metrics: Dict[str, Any]
    generated_at: datetime


class TrainModelRequest(BaseModel):
    product_sku: Optional[str] = None
    warehouse_id: Optional[int] = None
    model_type: str = Field(default="ensemble", description="prophet, arima, or ensemble")
    historical_days: int = Field(default=365, ge=30, le=730)


class TrainModelResponse(BaseModel):
    success: bool
    message: str
    model_type: str
    metrics: Dict[str, Any]
    model_path: str


class AnomalyDetectionRequest(BaseModel):
    product_sku: Optional[str] = None
    warehouse_id: Optional[int] = None
    threshold: float = Field(default=0.95, ge=0.5, le=0.99)
    days: int = Field(default=90, ge=7, le=365)


class AnomalyResponse(BaseModel):
    anomalies: List[Dict[str, Any]]
    total_count: int
    severity_distribution: Dict[str, int]


class ModelComparisonRequest(BaseModel):
    product_sku: Optional[str] = None
    warehouse_id: Optional[int] = None
    forecast_horizon: int = Field(default=30, ge=1, le=90)


class ModelComparisonResponse(BaseModel):
    prophet: List[Dict[str, Any]]
    arima: List[Dict[str, Any]]
    ensemble: List[Dict[str, Any]]
    metrics: Dict[str, Dict[str, Any]]