from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.temporal_graph import (
    LocationCreate,
    ShipmentGraphCreate,
    EventCreate,
    CausalRelationshipCreate,
    TimeTravelQuery,
    TimeTravelResponse,
    TemporalPathQuery,
    EventCorrelationQuery,
    ShipmentJourneyQuery,
    ShipmentJourneyResponse,
    GraphStatisticsResponse,
    CausalChainResponse,
    EventPatternResponse,
)
from app.services.ml.patentable.temporal_graph.graph_schema import TemporalGraphSchema
from app.services.ml.patentable.temporal_graph.temporal_queries import TemporalQueryEngine

router = APIRouter()


@router.post("/initialize")
async def initialize_temporal_graph(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """
    Initialize temporal knowledge graph schema
    
    Creates indexes, constraints, and prepares the graph database.
    """
    try:
        graph = TemporalGraphSchema()
        graph.initialize_schema()
        graph.close()
        
        return {
            "success": True,
            "message": "Temporal knowledge graph initialized successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/locations")
async def create_location_node(
    location: LocationCreate,
    current_user: User = Depends(get_current_user)
):
    """Create or update location node in graph"""
    try:
        graph = TemporalGraphSchema()
        
        result = graph.create_location(
            location_id=location.location_id,
            name=location.name,
            address=location.address,
            coordinates={
                'latitude': location.latitude,
                'longitude': location.longitude
            },
            location_type=location.location_type
        )
        
        graph.close()
        
        return {
            "success": True,
            "message": f"Location '{location.name}' created in graph",
            "location_id": location.location_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/shipments")
async def create_shipment_node(
    shipment: ShipmentGraphCreate,
    current_user: User = Depends(get_current_user)
):
    """Create shipment node with relationships in graph"""
    try:
        graph = TemporalGraphSchema()
        
        result = graph.create_shipment(
            shipment_id=shipment.shipment_id,
            tracking_number=shipment.tracking_number,
            status=shipment.status,
            origin_id=shipment.origin_id,
            destination_id=shipment.destination_id,
            created_at=shipment.created_at
        )
        
        graph.close()
        
        return {
            "success": True,
            "message": f"Shipment '{shipment.tracking_number}' created in graph",
            "shipment_id": shipment.shipment_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/events")
async def create_event_node(
    event: EventCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create temporal event node
    
    Events are timestamped nodes that track changes in the supply chain.
    """
    try:
        graph = TemporalGraphSchema()
        
        result = graph.create_event(
            event_id=event.event_id,
            event_type=event.event_type,
            shipment_id=event.shipment_id,
            timestamp=event.timestamp,
            location_id=event.location_id,
            metadata=event.metadata
        )
        
        graph.close()
        
        return {
            "success": True,
            "message": f"Event '{event.event_id}' created",
            "event_id": event.event_id,
            "event_type": event.event_type
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/causal-relationships")
async def create_causal_relationship(
    relationship: CausalRelationshipCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create causal relationship between events
    
    PATENTABLE: Automated causal inference in supply chain events
    """
    try:
        graph = TemporalGraphSchema()
        
        result = graph.create_causal_relationship(
            cause_event_id=relationship.cause_event_id,
            effect_event_id=relationship.effect_event_id,
            confidence=relationship.confidence,
            delay_seconds=relationship.delay_seconds
        )
        
        graph.close()
        
        return {
            "success": True,
            "message": "Causal relationship created",
            "cause": relationship.cause_event_id,
            "effect": relationship.effect_event_id,
            "confidence": relationship.confidence
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/time-travel", response_model=TimeTravelResponse)
async def time_travel_query(
    query: TimeTravelQuery,
    current_user: User = Depends(get_current_user)
):
    """
    Time-travel query: "What did we know at time T?"
    
    PATENTABLE: Reconstruct historical state of entities
    """
    try:
        engine = TemporalQueryEngine()
        
        result = engine.time_travel_query(
            entity_type=query.entity_type,
            entity_id=query.entity_id,
            as_of_time=query.as_of_time
        )
        
        engine.close()
        
        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"No state found for {query.entity_type} {query.entity_id} at {query.as_of_time}"
            )
        
        return TimeTravelResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/causal-chain/{event_id}", response_model=CausalChainResponse)
async def find_causal_chain(
    event_id: str,
    max_depth: int = 5,
    current_user: User = Depends(get_current_user)
):
    """
    Find causal chain starting from an event
    
    PATENTABLE: Automated causal chain discovery in supply chain
    """
    try:
        engine = TemporalQueryEngine()
        
        chains = engine.find_causal_chain(
            start_event_id=event_id,
            max_depth=max_depth
        )
        
        engine.close()
        
        return CausalChainResponse(
            start_event_id=event_id,
            chains=chains,
            total_chains=len(chains)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/temporal-paths")
async def temporal_path_query(
    query: TemporalPathQuery,
    current_user: User = Depends(get_current_user)
):
    """
    Find paths between locations within time window
    
    PATENTABLE: Temporal-aware path finding
    """
    try:
        engine = TemporalQueryEngine()
        
        paths = engine.temporal_path_query(
            start_location_id=query.start_location_id,
            end_location_id=query.end_location_id,
            time_window_start=query.time_window_start,
            time_window_end=query.time_window_end
        )
        
        engine.close()
        
        return {
            "start_location_id": query.start_location_id,
            "end_location_id": query.end_location_id,
            "time_window": {
                "start": query.time_window_start.isoformat(),
                "end": query.time_window_end.isoformat()
            },
            "paths": paths,
            "total_paths": len(paths)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/event-patterns/{event_type}", response_model=EventPatternResponse)
async def analyze_event_patterns(
    event_type: str,
    time_window_days: int = 30,
    current_user: User = Depends(get_current_user)
):
    """
    Analyze temporal patterns in events
    
    PATENTABLE: Temporal pattern recognition
    """
    try:
        engine = TemporalQueryEngine()
        
        patterns = engine.analyze_event_patterns(
            event_type=event_type,
            time_window_days=time_window_days
        )
        
        engine.close()
        
        return EventPatternResponse(**patterns)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/event-correlations")
async def find_event_correlations(
    query: EventCorrelationQuery,
    current_user: User = Depends(get_current_user)
):
    """
    Find temporal correlations between event types
    
    PATENTABLE: Automated correlation discovery
    """
    try:
        engine = TemporalQueryEngine()
        
        correlations = engine.find_correlated_events(
            event_type_1=query.event_type_1,
            event_type_2=query.event_type_2,
            max_time_diff_hours=query.max_time_diff_hours
        )
        
        engine.close()
        
        return correlations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/shipment-journey", response_model=ShipmentJourneyResponse)
async def reconstruct_shipment_journey(
    query: ShipmentJourneyQuery,
    current_user: User = Depends(get_current_user)
):
    """
    Reconstruct complete journey of a shipment with temporal context
    """
    try:
        engine = TemporalQueryEngine()
        
        journey = engine.reconstruct_shipment_journey(
            shipment_id=query.shipment_id,
            as_of_time=query.as_of_time
        )
        
        engine.close()
        
        if 'error' in journey:
            raise HTTPException(status_code=404, detail=journey['error'])
        
        return ShipmentJourneyResponse(**journey)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/statistics", response_model=GraphStatisticsResponse)
async def get_graph_statistics(
    current_user: User = Depends(get_current_user)
):
    """Get temporal knowledge graph statistics"""
    try:
        graph = TemporalGraphSchema()
        stats = graph.get_graph_statistics()
        graph.close()
        
        total_nodes = sum(v for k, v in stats.items() if k != 'total_relationships')
        
        return GraphStatisticsResponse(
            total_nodes=stats,
            total_relationships=stats.get('total_relationships', 0),
            summary=f"Graph contains {total_nodes} nodes and {stats.get('total_relationships', 0)} relationships"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sync-from-database")
async def sync_from_relational_database(
    background_tasks: BackgroundTasks,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Sync data from PostgreSQL to Neo4j temporal graph
    
    This creates graph nodes from existing relational data.
    """
    try:
        from app.models.warehouse import Warehouse
        from app.models.shipment import Shipment
        from datetime import datetime
        
        graph = TemporalGraphSchema()
        
        # Sync warehouses
        warehouses = db.query(Warehouse).limit(limit).all()
        for warehouse in warehouses:
            graph.create_location(
                location_id=warehouse.id,
                name=warehouse.name,
                address=warehouse.location or "Unknown",
                coordinates={'latitude': 0, 'longitude': 0},  # Add real coordinates if available
                location_type="warehouse"
            )
        
        # Sync shipments
        shipments = db.query(Shipment).limit(limit).all()
        for shipment in shipments:
            if shipment.origin_warehouse_id and shipment.destination_warehouse_id:
                graph.create_shipment(
                    shipment_id=shipment.id,
                    tracking_number=shipment.tracking_number,
                    status=shipment.status,
                    origin_id=shipment.origin_warehouse_id,
                    destination_id=shipment.destination_warehouse_id,
                    created_at=shipment.created_at
                )
                
                # Create initial event
                graph.create_event(
                    event_id=f"evt_{shipment.id}_created",
                    event_type="shipment_created",
                    shipment_id=shipment.id,
                    timestamp=shipment.created_at,
                    location_id=shipment.origin_warehouse_id,
                    metadata={"status": shipment.status}
                )
        
        graph.close()
        
        return {
            "success": True,
            "message": f"Synced {len(warehouses)} warehouses and {len(shipments)} shipments to temporal graph"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))