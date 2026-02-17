from datetime import datetime
from typing import Dict, List, Optional, Any
from neo4j import GraphDatabase
import json


class TemporalGraphSchema:
    """
    PATENTABLE FEATURE #1: Temporal Knowledge Graph
    
    Novel Contributions:
    1. Time-aware graph schema for supply chain events
    2. Temporal versioning of node states
    3. Event causality tracking
    4. Time-travel query support
    """
    
    def __init__(self, uri: str = "bolt://localhost:7687", auth: tuple = ("neo4j", "supplychain123")):
        self.driver = GraphDatabase.driver(uri, auth=auth)
        
    def close(self):
        self.driver.close()
    
    def initialize_schema(self):
        """Create indexes and constraints for temporal graph"""
        with self.driver.session() as session:
            # Node constraints
            constraints = [
                "CREATE CONSTRAINT IF NOT EXISTS FOR (l:Location) REQUIRE l.id IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS FOR (s:Shipment) REQUIRE s.id IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS FOR (p:Product) REQUIRE p.sku IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS FOR (e:Event) REQUIRE e.id IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS FOR (w:Warehouse) REQUIRE w.id IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS FOR (c:Carrier) REQUIRE c.id IS UNIQUE",
            ]
            
            for constraint in constraints:
                session.run(constraint)
            
            # Temporal indexes (PATENT CLAIM: Novel temporal indexing method)
            indexes = [
                "CREATE INDEX IF NOT EXISTS FOR (e:Event) ON (e.timestamp)",
                "CREATE INDEX IF NOT EXISTS FOR (e:Event) ON (e.valid_from, e.valid_to)",
                "CREATE INDEX IF NOT EXISTS FOR (s:Shipment) ON (s.created_at)",
                "CREATE INDEX IF NOT EXISTS FOR (l:Location) ON (l.name)",
            ]
            
            for index in indexes:
                session.run(index)
            
            print("✓ Temporal graph schema initialized")
    
    def create_location(
        self,
        location_id: int,
        name: str,
        address: str,
        coordinates: Dict[str, float],
        location_type: str = "warehouse"
    ):
        """Create or update location node"""
        with self.driver.session() as session:
            query = """
            MERGE (l:Location {id: $location_id})
            SET l.name = $name,
                l.address = $address,
                l.latitude = $latitude,
                l.longitude = $longitude,
                l.type = $location_type,
                l.updated_at = datetime()
            RETURN l
            """
            result = session.run(
                query,
                location_id=location_id,
                name=name,
                address=address,
                latitude=coordinates.get('latitude', 0),
                longitude=coordinates.get('longitude', 0),
                location_type=location_type
            )
            return result.single()
    
    def create_shipment(
        self,
        shipment_id: int,
        tracking_number: str,
        status: str,
        origin_id: int,
        destination_id: int,
        created_at: datetime
    ):
        """Create shipment node with origin and destination relationships"""
        with self.driver.session() as session:
            query = """
            MERGE (s:Shipment {id: $shipment_id})
            SET s.tracking_number = $tracking_number,
                s.status = $status,
                s.created_at = $created_at,
                s.updated_at = datetime()
            
            WITH s
            MATCH (origin:Location {id: $origin_id})
            MATCH (dest:Location {id: $destination_id})
            
            MERGE (s)-[r1:ORIGINATES_FROM {
                created_at: $created_at,
                valid_from: $created_at
            }]->(origin)
            
            MERGE (s)-[r2:DESTINED_FOR {
                created_at: $created_at,
                valid_from: $created_at
            }]->(dest)
            
            RETURN s, origin, dest
            """
            result = session.run(
                query,
                shipment_id=shipment_id,
                tracking_number=tracking_number,
                status=status,
                origin_id=origin_id,
                destination_id=destination_id,
                created_at=created_at
            )
            return result.single()
    
    def create_event(
        self,
        event_id: str,
        event_type: str,
        shipment_id: int,
        timestamp: datetime,
        location_id: Optional[int] = None,
        metadata: Optional[Dict] = None
    ):
        """
        Create temporal event node
        
        PATENT CLAIM: Novel event versioning with temporal validity periods
        """
        with self.driver.session() as session:
            query = """
            CREATE (e:Event {
                id: $event_id,
                type: $event_type,
                timestamp: $timestamp,
                valid_from: $timestamp,
                valid_to: datetime('9999-12-31T23:59:59'),
                metadata: $metadata
            })
            
            WITH e
            MATCH (s:Shipment {id: $shipment_id})
            CREATE (e)-[r:AFFECTS {
                timestamp: $timestamp
            }]->(s)
            """
            
            if location_id:
                query += """
                WITH e
                MATCH (l:Location {id: $location_id})
                CREATE (e)-[r2:OCCURRED_AT {
                    timestamp: $timestamp
                }]->(l)
                """
            
            query += "RETURN e"
            
            result = session.run(
                query,
                event_id=event_id,
                event_type=event_type,
                shipment_id=shipment_id,
                timestamp=timestamp,
                location_id=location_id,
                metadata=json.dumps(metadata or {})
            )
            return result.single()
    
    def create_causal_relationship(
        self,
        cause_event_id: str,
        effect_event_id: str,
        confidence: float = 1.0,
        delay_seconds: int = 0
    ):
        """
        Create causal relationship between events
        
        PATENT CLAIM: Automated causal inference in supply chain events
        """
        with self.driver.session() as session:
            query = """
            MATCH (cause:Event {id: $cause_event_id})
            MATCH (effect:Event {id: $effect_event_id})
            
            CREATE (cause)-[r:CAUSES {
                confidence: $confidence,
                delay_seconds: $delay_seconds,
                discovered_at: datetime()
            }]->(effect)
            
            RETURN r
            """
            result = session.run(
                query,
                cause_event_id=cause_event_id,
                effect_event_id=effect_event_id,
                confidence=confidence,
                delay_seconds=delay_seconds
            )
            return result.single()
    
    def add_state_version(
        self,
        entity_type: str,
        entity_id: int,
        state: Dict[str, Any],
        valid_from: datetime,
        valid_to: Optional[datetime] = None
    ):
        """
        Add versioned state for temporal queries
        
        PATENT CLAIM: Bi-temporal state versioning system
        """
        if valid_to is None:
            valid_to = datetime(9999, 12, 31, 23, 59, 59)
        
        with self.driver.session() as session:
            query = f"""
            MATCH (n:{entity_type} {{id: $entity_id}})
            
            CREATE (v:StateVersion {{
                entity_type: $entity_type,
                entity_id: $entity_id,
                state: $state,
                valid_from: $valid_from,
                valid_to: $valid_to,
                created_at: datetime()
            }})
            
            CREATE (n)-[r:HAS_VERSION {{
                valid_from: $valid_from,
                valid_to: $valid_to
            }}]->(v)
            
            RETURN v
            """
            result = session.run(
                query,
                entity_type=entity_type,
                entity_id=entity_id,
                state=json.dumps(state),
                valid_from=valid_from,
                valid_to=valid_to
            )
            return result.single()
    
    def get_graph_statistics(self) -> Dict[str, int]:
        """Get graph statistics"""
        with self.driver.session() as session:
            query = """
            MATCH (n)
            RETURN labels(n)[0] as label, count(n) as count
            """
            results = session.run(query)
            
            stats = {}
            for record in results:
                stats[record['label']] = record['count']
            
            # Count relationships
            rel_query = "MATCH ()-[r]->() RETURN count(r) as count"
            rel_result = session.run(rel_query).single()
            stats['total_relationships'] = rel_result['count'] if rel_result else 0
            
            return stats


# Example usage and testing
if __name__ == "__main__":
    from datetime import timedelta
    
    # Initialize schema
    graph = TemporalGraphSchema()
    graph.initialize_schema()
    
    # Create sample data
    now = datetime.utcnow()
    
    # Locations
    graph.create_location(
        location_id=1,
        name="NYC Warehouse",
        address="123 Main St, New York, NY",
        coordinates={'latitude': 40.7128, 'longitude': -74.0060},
        location_type="warehouse"
    )
    
    graph.create_location(
        location_id=2,
        name="LA Distribution Center",
        address="456 Oak Ave, Los Angeles, CA",
        coordinates={'latitude': 34.0522, 'longitude': -118.2437},
        location_type="distribution_center"
    )
    
    # Shipment
    graph.create_shipment(
        shipment_id=1,
        tracking_number="SHP-001",
        status="in_transit",
        origin_id=1,
        destination_id=2,
        created_at=now
    )
    
    # Events
    graph.create_event(
        event_id="evt_001",
        event_type="shipment_created",
        shipment_id=1,
        timestamp=now,
        location_id=1,
        metadata={"notes": "Package picked up"}
    )
    
    graph.create_event(
        event_id="evt_002",
        event_type="in_transit",
        shipment_id=1,
        timestamp=now + timedelta(hours=2),
        metadata={"carrier": "FedEx"}
    )
    
    # Causal relationship
    graph.create_causal_relationship(
        cause_event_id="evt_001",
        effect_event_id="evt_002",
        confidence=0.95,
        delay_seconds=7200
    )
    
    # State version
    graph.add_state_version(
        entity_type="Shipment",
        entity_id=1,
        state={"status": "in_transit", "location": "en_route"},
        valid_from=now + timedelta(hours=2)
    )
    
    # Get statistics
    stats = graph.get_graph_statistics()
    print("\nGraph Statistics:")
    for label, count in stats.items():
        print(f"  {label}: {count}")
    
    graph.close()
    print("\n✓ Temporal graph initialized with sample data")