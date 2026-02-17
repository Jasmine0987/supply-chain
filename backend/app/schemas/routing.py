from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Tuple


class Location(BaseModel):
    name: str
    address: Optional[str] = None
    coordinates: Tuple[float, float]  # (latitude, longitude)
    volume: float = Field(default=0, description="Shipment volume")
    time_window: Optional[Dict[str, Any]] = None


class RouteOptimizationRequest(BaseModel):
    start_location: str
    end_location: str
    waypoints: List[str]
    locations: List[Location]
    method: str = Field(default="genetic", description="Method: genetic, dijkstra")
    optimize_for: str = Field(default="distance", description="distance, cost, time")


class RouteConstraints(BaseModel):
    vehicle_capacity: float = Field(default=1000, description="Maximum capacity")
    max_distance_km: Optional[float] = None
    max_duration_hours: Optional[float] = None
    include_carbon: bool = True
    road_type: str = Field(default="default", description="highway, urban, rural, default")


class OptimizeWithConstraintsRequest(BaseModel):
    locations: List[Location]
    constraints: RouteConstraints


class RouteSegment(BaseModel):
    from_location: str
    to_location: str
    distance_km: float
    estimated_time_hours: float


class OptimizedRoute(BaseModel):
    route_id: int
    locations: List[str]
    distance_km: float
    estimated_duration_hours: float
    total_cost: float
    cost_breakdown: Dict[str, float]
    segments: List[RouteSegment]
    num_stops: int


class RouteComparisonRequest(BaseModel):
    routes: List[Dict[str, Any]]


class RouteComparisonResponse(BaseModel):
    routes: List[Dict[str, Any]]
    recommendation: Dict[str, Any]


class MultiVehicleRequest(BaseModel):
    shipments: List[Dict[str, Any]]
    vehicle_capacity: int = 100
    vehicle_cost_per_day: float = 200.0