from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class AnomalyDetectionRequest(BaseModel):
    product_sku: Optional[str] = None
    warehouse_id: Optional[int] = None
    sensor_id: Optional[int] = None
    method: str = Field(
        default="isolation_forest",
        description="Method: isolation_forest, z_score, iqr, mad, ensemble"
    )
    contamination: float = Field(default=0.1, ge=0.01, le=0.5)
    days: int = Field(default=90, ge=7, le=365)
    threshold: float = Field(default=3.0, ge=1.0, le=5.0)


class AnomalyResponse(BaseModel):
    method: str
    total_samples: int
    anomalies_detected: int
    anomaly_percentage: float
    anomalies: List[Dict[str, Any]]
    severity_distribution: Dict[str, int]
    generated_at: datetime


class TrainAnomalyModelRequest(BaseModel):
    data_source: str = Field(description="demand, sensor, inventory")
    method: str = Field(default="isolation_forest")
    contamination: float = Field(default=0.1, ge=0.01, le=0.5)
    historical_days: int = Field(default=180, ge=30, le=730)


class SensorThresholdAlert(BaseModel):
    sensor_id: int
    sensor_type: str
    current_value: float
    threshold_type: str
    threshold_value: float
    severity: str
    message: str
    timestamp: datetime