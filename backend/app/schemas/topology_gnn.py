"""
Pydantic Schemas for Topology GNN API
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from enum import Enum


class EntityType(str, Enum):
    SUPPLIER = "supplier"
    WAREHOUSE = "warehouse"
    DISTRIBUTOR = "distributor"
    CUSTOMER = "customer"
    ROUTE = "route"


class ConnectionType(str, Enum):
    SUPPLIES = "supplies"
    SHIPS_TO = "ships_to"
    DELIVERS_TO = "delivers_to"
    CONNECTS = "connects"


# Initialize Request
class NodeData(BaseModel):
    id: str
    type: EntityType
    attributes: Optional[Dict] = {}


class EdgeData(BaseModel):
    source: str
    target: str
    type: ConnectionType
    weight: Optional[float] = 1.0
    attributes: Optional[Dict] = {}


class InitializeTopologyRequest(BaseModel):
    nodes: List[NodeData]
    edges: List[EdgeData]


# Add Entity Request
class AddEntityRequest(BaseModel):
    entity_id: str
    entity_type: EntityType
    attributes: Dict = {}


# Add Connection Request
class AddConnectionRequest(BaseModel):
    source: str
    target: str
    connection_type: ConnectionType
    weight: Optional[float] = 1.0
    attributes: Optional[Dict] = {}


# Disruption Prediction Request
class DisruptionPredictionRequest(BaseModel):
    disrupted_entities: List[str]


# Alternative Routes Request
class AlternativeRoutesRequest(BaseModel):
    source: str
    destination: str
    num_routes: Optional[int] = 3


# Event Recording Request
class RecordEventRequest(BaseModel):
    event_type: str
    affected_entities: List[str]
    event_data: Dict


# Future Disruption Prediction Request
class FutureDisruptionRequest(BaseModel):
    horizon_days: Optional[int] = 30


# Node Detail
class NodeDetail(BaseModel):
    node_id: str
    type: str
    importance_score: float
    in_degree: int
    out_degree: int
    embedding: List[float]


# Critical Node
class CriticalNode(BaseModel):
    node_id: str
    importance: float


# Recommendation
class Recommendation(BaseModel):
    type: str
    target_node: Optional[str] = None
    reason: str
    suggested_action: str
    importance: Optional[float] = None


# Analysis Response
class AnalysisResponse(BaseModel):
    timestamp: str
    graph_statistics: Dict
    critical_nodes: List[CriticalNode]
    node_details: List[NodeDetail]
    recommendations: List[Recommendation]
    topology_health: str


# Disruption Impact Response
class DisruptionImpactResponse(BaseModel):
    disrupted_entities: List[str]
    total_impact: float
    avg_impact: float
    max_impact: float
    most_affected_entities: List[Dict]


# Route
class Route(BaseModel):
    path: List[str]
    length: int
    type: str


# Topology Insights
class AttentionSummary(BaseModel):
    total_events: int
    max_attention: float
    avg_attention: float
    top_attended_events: List[Dict]
    event_type_distribution: Dict


class RecurringPattern(BaseModel):
    event_type: str
    recurrence_days: float
    confidence: float
    occurrences: int
    last_occurrence: str


class TopologyEvolution(BaseModel):
    index: int
    timestamp: str
    num_nodes: int
    num_edges: int
    graph_density: float


class TopologyInsightsResponse(BaseModel):
    network_resilience: float
    critical_bottlenecks: int
    total_connections: int
    attention_summary: dict = {  # ← Add default
        'total_events': 0,
        'max_attention': 0,
        'avg_attention': 0,
        'top_attended_events': [],
        'event_type_distribution': {}
    }
    recurring_patterns: List[RecurringPattern]
    topology_evolution: List[TopologyEvolution]
    graph_statistics: Dict


# System Status
class SystemStatusResponse(BaseModel):
    initialized: bool
    total_nodes: int
    total_edges: int
    total_events: int
    topology_updates: int


# Future Disruption Prediction
class FutureDisruption(BaseModel):
    event_type: str
    probability: float
    expected_date: str
    similar_to: str
    affected_entities: List[str]