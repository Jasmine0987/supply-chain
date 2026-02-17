from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from enum import Enum


class DeviceType(str, Enum):
    IOT_SENSOR = "iot_sensor"
    RASPBERRY_PI = "raspberry_pi"
    JETSON_NANO = "jetson_nano"
    SMARTPHONE = "smartphone"


class OptimizationObjective(str, Enum):
    MINIMIZE_LATENCY = "latency"
    MINIMIZE_ENERGY = "energy"
    MINIMIZE_COST = "cost"
    BALANCED = "balanced"


class NetworkType(str, Enum):
    CNN = "cnn"
    LSTM = "lstm"
    TRANSFORMER = "transformer"


class CreateDeviceRequest(BaseModel):
    device_id: str
    device_type: DeviceType


class DeviceMetricsResponse(BaseModel):
    device_id: str
    device_type: str
    battery_level: float
    network_latency_ms: float
    bandwidth_mbps: float
    is_charging: bool
    ram_available_mb: float
    cpu_usage_percent: float
    timestamp: str


class PartitionRequest(BaseModel):
    device_id: str
    network_type: NetworkType = NetworkType.CNN
    objective: OptimizationObjective = OptimizationObjective.BALANCED
    constraints: Optional[Dict[str, Any]] = {}


class PartitionResponse(BaseModel):
    device_id: str
    optimal_partition_point: int
    objective: str
    cost_details: Dict[str, Any]
    deployment_plan: Dict[str, Any]


class AdaptiveRepartitionRequest(BaseModel):
    device_id: str
    current_partition: int
    objective: OptimizationObjective = OptimizationObjective.BALANCED


class AdaptiveRepartitionResponse(BaseModel):
    current_partition: int
    new_partition: int
    should_repartition: bool
    improvement_percent: float
    reasoning: Dict[str, Any]


class LayerAnalysisResponse(BaseModel):
    total_layers: int
    total_parameters: int
    total_flops: int
    total_memory_mb: float
    layers: List[Dict[str, Any]]
    partition_candidates: List[int]


class ComparePartitionsRequest(BaseModel):
    device_id: str
    network_type: NetworkType = NetworkType.CNN
    partition_points: List[int]
    objective: OptimizationObjective = OptimizationObjective.BALANCED