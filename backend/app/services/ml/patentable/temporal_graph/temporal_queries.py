from datetime import datetime
from typing import Dict, List, Optional, Any
from neo4j import GraphDatabase
import json


class TemporalQueryEngine:
    """
    PATENTABLE FEATURE: Time-travel and temporal query capabilities
    
    Novel Contributions:
    1. Bi-temporal query system (valid time + transaction time)
    2. "What did we know at time T?" queries
    3. Temporal path finding
    4. Historical state reconstruction
    """
    
    def __init__(self, uri: str = "bolt://localhost:7687", auth: tuple = ("neo4j", "supplychain123")):
        self.driver = GraphDatabase.driver(uri, auth=auth)
    
    def close(self):
        self.driver.close()
    
    def time_travel_query(
        self,
        entity_type: str,
        entity_id: int,
        as_of_time: datetime
    ) -> Optional[Dict]:
        """
        PATENT CLAIM: Time-travel query to reconstruct historical state
        
        Returns the state of an entity as it was known at a specific point in time.
        """
        with self.driver.session() as session:
            query = f"""
            MATCH (n:{entity_type} {{id: $entity_id}})-[r:HAS_VERSION]->(v:StateVersion)
            WHERE v.valid_from <= $as_of_time 
              AND v.valid_to > $as_of_time
            RETURN v.state as state, v.valid_from as valid_from, v.valid_to as valid_to
            ORDER BY v.valid_from DESC
            LIMIT 1
            """
            result = session.run(
                query,
                entity_id=entity_id,
                as_of_time=as_of_time
            ).single()
            
            if result:
                return {
                    'entity_type': entity_type,
                    'entity_id': entity_id,
                    'as_of_time': as_of_time.isoformat(),
                    'state': json.loads(result['state']),
                    'valid_from': result['valid_from'],
                    'valid_to': result['valid_to']
                }
            return None
    
    def get_state_history(
        self,
        entity_type: str,
        entity_id: int,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> List[Dict]:
        """Get complete state history for an entity"""
        with self.driver.session() as session:
            query = f"""
            MATCH (n:{entity_type} {{id: $entity_id}})-[r:HAS_VERSION]->(v:StateVersion)
            """
            
            conditions = []
            params = {'entity_id': entity_id}
            
            if start_time:
                conditions.append("v.valid_from >= $start_time")
                params['start_time'] = start_time
            
            if end_time:
                conditions.append("v.valid_from <= $end_time")
                params['end_time'] = end_time
            
            if conditions:
                query += " WHERE " + " AND ".join(conditions)
            
            query += """
            RETURN v.state as state, 
                   v.valid_from as valid_from, 
                   v.valid_to as valid_to
            ORDER BY v.valid_from ASC
            """
            
            results = session.run(query, **params)
            
            history = []
            for record in results:
                history.append({
                    'state': json.loads(record['state']),
                    'valid_from': record['valid_from'],
                    'valid_to': record['valid_to']
                })
            
            return history
    
    def find_causal_chain(
        self,
        start_event_id: str,
        max_depth: int = 5
    ) -> List[Dict]:
        """
        PATENT CLAIM: Automated causal chain discovery
        
        Find all events caused by a starting event.
        """
        with self.driver.session() as session:
            query = """
            MATCH path = (start:Event {id: $start_event_id})-[:CAUSES*1..{max_depth}]->(end:Event)
            RETURN path,
                   length(path) as depth,
                   [rel in relationships(path) | rel.confidence] as confidences
            ORDER BY depth ASC
            """
            query = query.replace('{max_depth}', str(max_depth))
            
            results = session.run(query, start_event_id=start_event_id)
            
            chains = []
            for record in results:
                path = record['path']
                nodes = [dict(node) for node in path.nodes]
                
                chains.append({
                    'depth': record['depth'],
                    'events': nodes,
                    'confidences': record['confidences'],
                    'average_confidence': sum(record['confidences']) / len(record['confidences']) if record['confidences'] else 0
                })
            
            return chains
    
    def temporal_path_query(
        self,
        start_location_id: int,
        end_location_id: int,
        time_window_start: datetime,
        time_window_end: datetime
    ) -> List[Dict]:
        """
        Find paths between locations that existed during a time window
        
        PATENT CLAIM: Temporal-aware path finding
        """
        with self.driver.session() as session:
            query = """
            MATCH path = (start:Location {id: $start_id})<-[:ORIGINATES_FROM]-(s:Shipment)-[:DESTINED_FOR]->(end:Location {id: $end_id})
            WHERE s.created_at >= $time_start AND s.created_at <= $time_end
            RETURN s.id as shipment_id,
                   s.tracking_number as tracking,
                   s.created_at as created_at,
                   s.status as status
            ORDER BY s.created_at DESC
            """
            results = session.run(
                query,
                start_id=start_location_id,
                end_id=end_location_id,
                time_start=time_window_start,
                time_end=time_window_end
            )
            
            paths = []
            for record in results:
                paths.append({
                    'shipment_id': record['shipment_id'],
                    'tracking_number': record['tracking'],
                    'created_at': record['created_at'],
                    'status': record['status']
                })
            
            return paths
    
    def analyze_event_patterns(
        self,
        event_type: str,
        time_window_days: int = 30
    ) -> Dict[str, Any]:
        """
        Analyze patterns in event occurrences
        
        PATENT CLAIM: Temporal pattern recognition in supply chain events
        """
        with self.driver.session() as session:
            query = """
            MATCH (e:Event {type: $event_type})
            WHERE e.timestamp >= datetime() - duration({days: $days})
            WITH e
            ORDER BY e.timestamp ASC
            
            WITH collect(e) as events
            RETURN 
                size(events) as total_count,
                events[0].timestamp as first_occurrence,
                events[-1].timestamp as last_occurrence
            """
            result = session.run(
                query,
                event_type=event_type,
                days=time_window_days
            ).single()
            
            if not result:
                return {'event_type': event_type, 'total_count': 0}
            
            # Calculate frequency
            if result['total_count'] > 1:
                duration = (result['last_occurrence'] - result['first_occurrence']).total_seconds()
                frequency = result['total_count'] / (duration / 86400) if duration > 0 else 0  # per day
            else:
                frequency = 0
            
            return {
                'event_type': event_type,
                'total_count': result['total_count'],
                'first_occurrence': result['first_occurrence'],
                'last_occurrence': result['last_occurrence'],
                'frequency_per_day': frequency
            }
    
    def find_correlated_events(
        self,
        event_type_1: str,
        event_type_2: str,
        max_time_diff_hours: int = 24
    ) -> Dict[str, Any]:
        """
        Find temporal correlations between different event types
        
        PATENT CLAIM: Automated correlation discovery in temporal event streams
        """
        with self.driver.session() as session:
            query = """
            MATCH (e1:Event {type: $type1})
            MATCH (e2:Event {type: $type2})
            WHERE e1.timestamp < e2.timestamp
              AND duration.between(e1.timestamp, e2.timestamp).hours <= $max_hours
            
            WITH e1, e2, duration.between(e1.timestamp, e2.timestamp).seconds as time_diff
            RETURN 
                count(*) as correlation_count,
                avg(time_diff) as avg_time_diff_seconds,
                min(time_diff) as min_time_diff,
                max(time_diff) as max_time_diff
            """
            result = session.run(
                query,
                type1=event_type_1,
                type2=event_type_2,
                max_hours=max_time_diff_hours
            ).single()
            
            if not result or result['correlation_count'] == 0:
                return {
                    'event_type_1': event_type_1,
                    'event_type_2': event_type_2,
                    'correlation_found': False
                }
            
            return {
                'event_type_1': event_type_1,
                'event_type_2': event_type_2,
                'correlation_found': True,
                'correlation_count': result['correlation_count'],
                'avg_time_diff_hours': result['avg_time_diff_seconds'] / 3600,
                'min_time_diff_hours': result['min_time_diff'] / 3600,
                'max_time_diff_hours': result['max_time_diff'] / 3600
            }
    
    def reconstruct_shipment_journey(
        self,
        shipment_id: int,
        as_of_time: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Reconstruct complete journey of a shipment with temporal context
        """
        with self.driver.session() as session:
            # Get shipment info
            shipment_query = """
            MATCH (s:Shipment {id: $shipment_id})
            MATCH (s)-[:ORIGINATES_FROM]->(origin:Location)
            MATCH (s)-[:DESTINED_FOR]->(dest:Location)
            RETURN s, origin, dest
            """
            shipment_result = session.run(shipment_query, shipment_id=shipment_id).single()
            
            if not shipment_result:
                return {'error': 'Shipment not found'}
            
            # Get all events
            event_query = """
            MATCH (e:Event)-[:AFFECTS]->(s:Shipment {id: $shipment_id})
            """
            
            if as_of_time:
                event_query += " WHERE e.timestamp <= $as_of_time"
            
            event_query += """
            OPTIONAL MATCH (e)-[:OCCURRED_AT]->(l:Location)
            RETURN e, l
            ORDER BY e.timestamp ASC
            """
            
            params = {'shipment_id': shipment_id}
            if as_of_time:
                params['as_of_time'] = as_of_time
            
            event_results = session.run(event_query, **params)
            
            events = []
            for record in event_results:
                event = dict(record['e'])
                location = dict(record['l']) if record['l'] else None
                
                events.append({
                    'event_id': event['id'],
                    'type': event['type'],
                    'timestamp': event['timestamp'],
                    'location': location['name'] if location else None,
                    'metadata': json.loads(event.get('metadata', '{}'))
                })
            
            shipment = dict(shipment_result['s'])
            origin = dict(shipment_result['origin'])
            dest = dict(shipment_result['dest'])
            
            return {
                'shipment_id': shipment_id,
                'tracking_number': shipment['tracking_number'],
                'status': shipment['status'],
                'origin': origin['name'],
                'destination': dest['name'],
                'events': events,
                'as_of_time': as_of_time.isoformat() if as_of_time else 'current'
            }


# Example usage
if __name__ == "__main__":
    from datetime import timedelta
    
    query_engine = TemporalQueryEngine()
    
    # Time-travel query
    past_time = datetime.utcnow() - timedelta(hours=1)
    state = query_engine.time_travel_query(
        entity_type="Shipment",
        entity_id=1,
        as_of_time=past_time
    )
    print("\nTime-travel query result:")
    print(json.dumps(state, indent=2, default=str))
    
    # Find causal chains
    chains = query_engine.find_causal_chain("evt_001", max_depth=3)
    print(f"\nFound {len(chains)} causal chains")
    
    # Reconstruct journey
    journey = query_engine.reconstruct_shipment_journey(shipment_id=1)
    print("\nShipment journey:")
    print(json.dumps(journey, indent=2, default=str))
    
    query_engine.close()