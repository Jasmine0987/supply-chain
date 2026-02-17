"""
Pydantic Schemas for Probabilistic Inventory API
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Tuple, Any
from enum import Enum


class AllocationStrategy(str, Enum):
    NASH_EQUILIBRIUM = "nash_equilibrium"
    PROPORTIONAL = "proportional"
    SAFETY_STOCK = "safety_stock"


class PriorityLevel(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


# Warehouse Registration
class RegisterWarehouseRequest(BaseModel):
    warehouse_id: str
    capacity: int = Field(..., gt=0)
    current_stock: int = Field(..., ge=0)
    latitude: float
    longitude: float
    demand_priority: float = Field(default=1.0, ge=0, le=2)


# Load Historical Demand
class LoadDemandHistoryRequest(BaseModel):
    product_id: str
    warehouse_id: str
    demand_history: List[float]


# Multi-Forecast Response
class MultiForecastResponse(BaseModel):
    optimistic: List[float]
    most_likely: List[float]
    pessimistic: List[float]
    metadata: Dict[str, Any]


# Allocation Generation
class GenerateAllocationRequest(BaseModel):
    product_id: str
    total_inventory: int = Field(..., gt=0)
    warehouse_ids: List[str]
    forecast_days: int = Field(default=30, ge=1, le=90)
    allocation_strategy: AllocationStrategy = AllocationStrategy.NASH_EQUILIBRIUM


class AllocationResponse(BaseModel):
    product_id: str
    total_inventory: int
    allocation_strategy: str
    allocations: Dict[str, int]
    expected_demands: Dict[str, float]
    confidence_metrics: Dict[str, float]
    fairness_score: float
    timestamp: str
    metadata: Dict[str, Any]


# Reallocation Check
class CheckReallocationRequest(BaseModel):
    product_id: str
    actual_demands: Dict[str, List[float]]  # warehouse_id -> recent demand values


class ReallocationRecommendation(BaseModel):
    warehouse_id: str
    current_stock: int
    expected_demand: float
    days_of_stock: float
    forecast_confidence: float
    reason: str
    priority: PriorityLevel
    action: str  # 'increase' or 'decrease'


class TransferPlan(BaseModel):
    from_warehouse: str
    to_warehouse: str
    amount: int


class ReallocationResponse(BaseModel):
    product_id: str
    recommendations: List[ReallocationRecommendation]
    transfer_plan: Dict[str, Dict[str, int]]  # from_wh -> {to_wh: amount}
    execution_report: Dict[str, Any]
    updated_allocations: Dict[str, int]


# Allocation Summary
class AllocationSummaryResponse(BaseModel):
    product_id: str
    allocations: Dict[str, int]
    expected_demands: Dict[str, float]
    total_inventory: int
    allocation_age_days: int
    average_confidence: float
    needs_reforecast: bool


# Strategy Comparison
class CompareStrategiesRequest(BaseModel):
    product_id: str
    total_inventory: int = Field(..., gt=0)
    warehouse_ids: List[str]
    strategies: Optional[List[AllocationStrategy]] = None


class StrategyComparison(BaseModel):
    allocations: Dict[str, int]
    fairness_score: float
    service_levels: Dict[str, float]
    avg_service_level: float


class CompareStrategiesResponse(BaseModel):
    product_id: str
    total_inventory: int
    comparisons: Dict[str, StrategyComparison]


# System Health
class SystemHealthResponse(BaseModel):
    status: str
    total_products: int
    average_confidence: float=0.0
    stale_allocations: int=0
    stale_percentage: float=0.0
    total_reallocations_today: int=0


# Forecast Detail
class ForecastDetailResponse(BaseModel):
    product_id: str
    warehouse_id: str
    forecasts: MultiForecastResponse
    confidence: float
    forecast_age_days: int


# Reallocation History
class ReallocationHistoryItem(BaseModel):
    product_id: str
    timestamp: str
    transfers: List[Dict[str, Any]]
    total_units_moved: int
    estimated_cost: float
    success: bool


class ReallocationHistoryResponse(BaseModel):
    history: List[ReallocationHistoryItem]
    total_records: int


# Confidence Bands
class ConfidenceBand(BaseModel):
    day: int
    lower_bound: float
    upper_bound: float


class ConfidenceBandsResponse(BaseModel):
    product_id: str
    warehouse_id: str
    bands: List[ConfidenceBand]
    optimistic_confidence: float
    pessimistic_confidence: float