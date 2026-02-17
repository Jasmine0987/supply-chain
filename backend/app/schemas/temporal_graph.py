from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class LocationCreate(BaseModel):
    location_id: int
    name: str
    address: str
    latitude: float
    longitude: float
    location_type: str = "warehouse"


class ShipmentGraphCreate(BaseModel):
    shipment_id: int
    tracking_number: str
    status: str
    origin_id: int
    destination_id: int
    created_at: datetime


class EventCreate(BaseModel):
    event_id: str
    event_type: str
    shipment_id: int
    timestamp: datetime
    location_id: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = {}


class CausalRelationshipCreate(BaseModel):
    cause_event_id: str
    effect_event_id: str
    confidence: float = Field(ge=0.0, le=1.0, default=1.0)
    delay_seconds: int = 0


class TimeTravelQuery(BaseModel):
    entity_type: str = Field(description="Shipment, Location, etc.")
    entity_id: int
    as_of_time: datetime


class TemporalPathQuery(BaseModel):
    start_location_id: int
    end_location_id: int
    time_window_start: datetime
    time_window_end: datetime


class EventCorrelationQuery(BaseModel):
    event_type_1: str
    event_type_2: str
    max_time_diff_hours: int = 24


class ShipmentJourneyQuery(BaseModel):
    shipment_id: int
    as_of_time: Optional[datetime] = None


class GraphStatisticsResponse(BaseModel):
    total_nodes: Dict[str, int]
    total_relationships: int
    summary: str


class TimeTravelResponse(BaseModel):
    entity_type: str
    entity_id: int
    as_of_time: str
    state: Dict[str, Any]
    valid_from: datetime
    valid_to: datetime


class CausalChainResponse(BaseModel):
    start_event_id: str
    chains: List[Dict[str, Any]]
    total_chains: int


class EventPatternResponse(BaseModel):
    event_type: str
    total_count: int
    first_occurrence: Optional[datetime]
    last_occurrence: Optional[datetime]
    frequency_per_day: float


class ShipmentJourneyResponse(BaseModel):
    shipment_id: int
    tracking_number: str
    status: str
    origin: str
    destination: str
    events: List[Dict[str, Any]]
    as_of_time: str