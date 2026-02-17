"""
Pydantic Schemas for Sensor Fusion API
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Optional
from datetime import datetime
from enum import Enum


class SensorType(str, Enum):
    TEMPERATURE = "temperature"
    HUMIDITY = "humidity"
    SHOCK = "shock"
    VIBRATION = "vibration"
    GPS = "gps"


class DamageLevel(str, Enum):
    MINIMAL = "minimal"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


# Sensor Reading
class SensorReading(BaseModel):
    sensor_type: SensorType
    timestamp: str
    value: float
    metadata: Optional[Dict] = {}


# Add Sensor Reading Request
class AddSensorReadingRequest(BaseModel):
    sensor_type: SensorType
    timestamp: str
    value: float
    metadata: Optional[Dict] = {}


# Process Shipment Request
class ProcessShipmentRequest(BaseModel):
    shipment_id: str
    sensor_data: List[Dict]  # List of readings with timestamp


# Real-time Analysis Request
class RealTimeAnalysisRequest(BaseModel):
    sensor_readings: Dict[str, float]


# Damage Prediction Response
class DamagePrediction(BaseModel):
    damage_probability: float
    uncertainty: float
    damage_level: DamageLevel
    contributions: Dict[str, Dict]
    primary_contributors: List[Dict]
    recommendations: List[str]


# Cumulative Damage Response
class CumulativeDamageResponse(BaseModel):
    final_damage_probability: float
    damage_level: DamageLevel
    timeline: List[Dict]
    total_exposure_time: float
    peak_instant_damage: float
    recommendations: List[str]


# Anomaly Detection
class AnomalyDetail(BaseModel):
    index: int
    timestamp: str
    sensor_type: str
    value: float
    severity:str
    sensors: Dict[str, float]
    anomaly_score: float
    class config:
        json_encoders={
            datetime: lambda v: v.isoformat()
        }


class AnomalySummary(BaseModel):
    count: int
    details: List[AnomalyDetail]


# Causal Graph
class CausalEdge(BaseModel):
    from_sensor: str = Field(..., alias='from')
    to_sensor: str = Field(..., alias='to')
    strength: float
    lag: int
    mechanism: str
    
    model_config = ConfigDict(populate_by_name=True)


class CausalGraphSummary(BaseModel):
    nodes: List[str]
    edges: List[CausalEdge]
    total_edges: int


# Sensor Statistics
class SensorStatistics(BaseModel):
    count: int
    mean: float
    std: float
    min: float
    max: float
    coverage: float


# Shipment Report
class ShipmentReportResponse(BaseModel):
    shipment_id: str
    processing_timestamp: str
    data_summary: Dict
    overall_risk_score: float
    damgage_probability: float
    damage_prediction: CumulativeDamageResponse
    critical_events: List[Dict] 
    anomalies: dict
    causal_analysis: CausalGraphSummary
    alignment_quality: Dict[str, float]
    sensor_statistics: Dict[str, SensorStatistics]
    recommendations: List[str]
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


# Real-time Analysis Response
class RealTimeAnalysisResponse(BaseModel):
    timestamp: str
    observed_sensors: Dict[str, float]
    inferred_sensors: Dict[str, Dict]
    damage_prediction: DamagePrediction
    anomaly: Dict


# System Health
class SystemHealthResponse(BaseModel):
    initialized: bool
    total_shipments_processed: int
    sensor_types: List[str]
    causal_edges: int
    damage_statistics: Dict


# Causal Graph Export
class CausalGraphExportResponse(BaseModel):
    nodes: List[str]
    edges: List[CausalEdge]
    total_edges: int


# Training Request
class TrainModelRequest(BaseModel):
    historical_data: List[Dict]
    method: Optional[str] = "granger"


# Calibration Request
class CalibrateModelRequest(BaseModel):
    training_data: List[Dict]
    actual_damages: List[bool]