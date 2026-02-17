"""
Topology-Aware GNN Engine
PATENTABLE: Complete supply chain topology intelligence system
"""
from typing import Dict, List, Optional
from datetime import datetime
import logging

from .graph_constructor import SupplyChainGraph
from .gnn_model import SupplyChainGNN
from .temporal_attention import TemporalAttention
from .topology_updater import TopologyUpdater

logger = logging.getLogger(__name__)


class TopologyGNNEngine:
    """
    PATENTABLE: Complete topology-aware GNN system
    
    Integrates:
    1. Dynamic graph construction
    2. GNN-based learning
    3. Temporal attention
    4. Topology updates and optimization
    """
    
    def __init__(
        self,
        input_dim: int = 10,
        hidden_dim: int = 64,
        output_dim: int = 32,
        num_layers: int = 3
    ):
        """Initialize topology GNN engine"""
        self.graph = SupplyChainGraph()
        self.gnn = SupplyChainGNN(input_dim, hidden_dim, output_dim, num_layers)
        self.attention = TemporalAttention(embedding_dim=output_dim)
        self.updater = TopologyUpdater(self.graph, self.gnn, self.attention)
        
        self.initialized = False
        self.analysis_cache = {}
    
    def initialize(self, initial_topology: Optional[Dict] = None):
        """
        Initialize engine with optional topology
        
        Args:
            initial_topology: Dict with 'nodes' and 'edges' lists
        """
        if initial_topology:
            # Add nodes
            for node_data in initial_topology.get('nodes', []):
                self.graph.add_node(
                    node_id=node_data['id'],
                    node_type=node_data['type'],
                    attributes=node_data.get('attributes', {})
                )
            
            # Add edges
            for edge_data in initial_topology.get('edges', []):
                self.graph.add_edge(
                    source=edge_data['source'],
                    target=edge_data['target'],
                    edge_type=edge_data['type'],
                    weight=edge_data.get('weight', 1.0),
                    attributes=edge_data.get('attributes', {})
                )
        
        self.initialized = True
        logger.info("Topology GNN engine initialized")
    
    def add_supply_chain_entity(
        self,
        entity_id: str,
        entity_type: str,
        attributes: Dict
    ) -> Dict:
        """
        Add new entity to supply chain
        
        Args:
            entity_id: Unique identifier
            entity_type: supplier, warehouse, distributor, customer
            attributes: Entity properties
        
        Returns:
            Operation result
        """
        try:
            self.graph.add_node(entity_id, entity_type, attributes)
            
            # Update topology
            update_report = self.updater.update_topology(
                updates=[{
                    'type': 'add_node',
                    'node_id': entity_id,
                    'node_type': entity_type,
                    'attributes': attributes
                }]
            )
            
            return {
                'success': True,
                'message': f'Added {entity_type}: {entity_id}',
                'update_report': update_report
            }
        except Exception as e:
            logger.error(f"Failed to add entity: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def add_supply_chain_connection(
        self,
        source: str,
        target: str,
        connection_type: str,
        weight: float = 1.0,
        attributes: Dict = None
    ) -> Dict:
        """
        Add connection between entities
        
        Args:
            source: Source entity ID
            target: Target entity ID
            connection_type: Type of relationship
            weight: Connection strength
            attributes: Additional properties
        
        Returns:
            Operation result
        """
        try:
            self.graph.add_edge(source, target, connection_type, weight, attributes)
            
            update_report = self.updater.update_topology(
                updates=[{
                    'type': 'add_edge',
                    'source': source,
                    'target': target,
                    'edge_type': connection_type,
                    'weight': weight,
                    'attributes': attributes
                }]
            )
            
            return {
                'success': True,
                'message': f'Added connection: {source} -> {target}',
                'update_report': update_report
            }
        except Exception as e:
            logger.error(f"Failed to add connection: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def analyze_supply_chain(self) -> Dict:
        """
        Comprehensive supply chain analysis
        
        PATENTABLE: GNN-powered supply chain intelligence
        
        Returns:
            Complete analysis report
        """
        if not self.initialized:
            self.initialize()
        
        features = self.graph.get_feature_matrix()
        adj_matrix = self.graph.get_adjacency_matrix()
        
        # Get node embeddings
        embeddings = self.gnn.get_node_embeddings(features, adj_matrix)
        
        # Find critical nodes
        critical_nodes = self.gnn.find_critical_nodes(features, adj_matrix, top_k=10)
        
        # Get graph statistics
        graph_stats = self.graph.get_graph_statistics()
        
        # Compute node importance
        importance = self.gnn.compute_node_importance(features, adj_matrix)
        
        # Get optimization recommendations
        recommendations = self.updater.recommend_topology_optimization()
        
        # Node details
        node_details = []
        node_ids = list(self.graph.nodes.keys())
        
        for i, node_id in enumerate(node_ids):
            if i < len(importance):
                node_details.append({
                    'node_id': node_id,
                    'type': self.graph.nodes[node_id]['type'],
                    'importance_score': float(importance[i]),
                    'in_degree': self.graph.get_node_degree(node_id)[0],
                    'out_degree': self.graph.get_node_degree(node_id)[1],
                    'embedding': embeddings[i].tolist() if i < len(embeddings) else []
                })
        
        return {
            'timestamp': datetime.now().isoformat(),
            'graph_statistics': graph_stats,
            'critical_nodes': [
                {
                    'node_id': node_ids[idx] if idx < len(node_ids) else f'node_{idx}',
                    'importance': float(score)
                }
                for idx, score in critical_nodes
            ],
            'node_details': node_details,
            'recommendations': recommendations,
            'topology_health': self._assess_topology_health(graph_stats)
        }
    
    def predict_disruption_impact(
        self,
        disrupted_entities: List[str]
    ) -> Dict:
        """
        Predict impact of disrupting specific entities
        
        PATENTABLE: GNN-based disruption impact prediction
        
        Args:
            disrupted_entities: List of entity IDs to disrupt
        
        Returns:
            Impact analysis
        """
        features = self.graph.get_feature_matrix()
        adj_matrix = self.graph.get_adjacency_matrix()
        
        # Map entity IDs to indices
        node_ids = list(self.graph.nodes.keys())
        disrupted_indices = [
            node_ids.index(entity)
            for entity in disrupted_entities
            if entity in node_ids
        ]
        
        # Simulate disruption
        impact = self.gnn.simulate_disruption(
            features,
            adj_matrix,
            disrupted_indices
        )
        
        # Add entity names
        impact['disrupted_entities'] = disrupted_entities
        impact['most_affected_entities'] = [
            {
                'entity_id': node_ids[node['node_id']] if node['node_id'] < len(node_ids) else f"node_{node['node_id']}",
                'impact_score': node['impact_score']
            }
            for node in impact['most_affected_nodes']
        ]
        
        return impact
    
    def find_alternative_routes(
        self,
        source: str,
        destination: str,
        num_routes: int = 3
    ) -> List[Dict]:
        """
        Find alternative supply routes
        
        Args:
            source: Source entity
            destination: Destination entity
            num_routes: Number of alternative routes
        
        Returns:
            List of routes with scores
        """
        # Find primary path
        primary_path = self.graph.find_path(source, destination)
        
        if primary_path is None:
            return []
        
        routes = [{
            'path': primary_path,
            'length': len(primary_path),
            'type': 'primary'
        }]
        
        # Find alternative paths (simplified - would need more sophisticated algorithm)
        # For now, just return the primary path
        
        return routes
    
    def record_supply_chain_event(
        self,
        event_type: str,
        affected_entities: List[str],
        event_data: Dict
    ):
        """
        Record supply chain event for temporal analysis
        
        Args:
            event_type: Type of event (disruption, demand_spike, etc.)
            affected_entities: Entities affected
            event_data: Event details
        """
        # Get current embeddings for affected nodes
        features = self.graph.get_feature_matrix()
        adj_matrix = self.graph.get_adjacency_matrix()
        embeddings = self.gnn.get_node_embeddings(features, adj_matrix)
        
        node_ids = list(self.graph.nodes.keys())
        affected_indices = [
            node_ids.index(entity)
            for entity in affected_entities
            if entity in node_ids
        ]
        
        # Average embedding for affected nodes
        if len(affected_indices) > 0:
            event_embedding = embeddings[affected_indices].mean(axis=0)
        else:
            event_embedding = embeddings.mean(axis=0)
        
        # Add to temporal attention
        self.attention.add_event(
            timestamp=datetime.now(),
            event_embedding=event_embedding,
            event_type=event_type,
            affected_nodes=affected_indices
        )
    
    def predict_future_disruptions(
        self,
        horizon_days: int = 30
    ) -> List[Dict]:
        """
        Predict likely future disruptions
        
        PATENTABLE: Temporal pattern-based disruption prediction
        
        Args:
            horizon_days: Days to predict ahead
        
        Returns:
            List of predicted disruptions
        """
        features = self.graph.get_feature_matrix()
        adj_matrix = self.graph.get_adjacency_matrix()
        embeddings = self.gnn.get_node_embeddings(features, adj_matrix)
        
        # Use temporal attention to predict
        query_embedding = embeddings.mean(axis=0)
        predictions = self.attention.predict_future_events(
            query_embedding,
            datetime.now(),
            horizon_days
        )
        
        # Convert node indices to entity IDs
        node_ids = list(self.graph.nodes.keys())
        for pred in predictions:
            pred['affected_entities'] = [
                node_ids[idx] if idx < len(node_ids) else f'node_{idx}'
                for idx in pred['affected_nodes']
            ]
        
        return predictions
    
    def get_topology_insights(self) -> Dict:
        """
        Get comprehensive topology insights
        
        Returns:
            Insights and recommendations
        """
        # Get attention summary
        features = self.graph.get_feature_matrix()
        adj_matrix = self.graph.get_adjacency_matrix()
        embeddings = self.gnn.get_node_embeddings(features, adj_matrix)
        query = embeddings.mean(axis=0)
        
        attention_summary = self.attention.get_attention_summary(query, datetime.now())
        
        # Get recurring patterns
        patterns = self.attention.identify_recurring_patterns()
        
        # Get topology evolution
        evolution = self.updater.get_topology_evolution()
        
        return {
            'attention_summary': attention_summary,
            'recurring_patterns': patterns,
            'topology_evolution': evolution,
            'graph_statistics': self.graph.get_graph_statistics()
        }
    
    def _assess_topology_health(self, stats: Dict) -> str:
        """
        Assess overall topology health
        
        Returns:
            'healthy', 'warning', or 'critical'
        """
        density = stats.get('graph_density', 0)
        avg_degree = stats.get('avg_degree', 0)
        
        if density > 0.1 and avg_degree > 2:
            return 'healthy'
        elif density > 0.05 and avg_degree > 1:
            return 'warning'
        else:
            return 'critical'
    
    def get_system_status(self) -> Dict:
        """Get system status"""
        return {
            'initialized': self.initialized,
            'total_nodes': len(self.graph.nodes),
            'total_edges': len(self.graph.edges),
            'total_events': len(self.attention.event_history),
            'topology_updates': len(self.updater.update_history)
        }


# Example usage
if __name__ == "__main__":
    # Create engine
    engine = TopologyGNNEngine(input_dim=10, hidden_dim=32, output_dim=16)
    
    # Initialize with topology
    initial_topology = {
        'nodes': [
            {'id': 'SUP001', 'type': 'supplier', 'attributes': {'capacity': 1000}},
            {'id': 'WH001', 'type': 'warehouse', 'attributes': {'capacity': 5000}},
            {'id': 'CUST001', 'type': 'customer', 'attributes': {}}
        ],
        'edges': [
            {'source': 'SUP001', 'target': 'WH001', 'type': 'supplies', 'weight': 0.9},
            {'source': 'WH001', 'target': 'CUST001', 'type': 'delivers_to', 'weight': 0.8}
        ]
    }
    
    engine.initialize(initial_topology)
    
    # Analyze
    analysis = engine.analyze_supply_chain()
    print(f"Supply chain analysis: {analysis['graph_statistics']}")
    
    # Predict disruption
    impact = engine.predict_disruption_impact(['SUP001'])
    print(f"Disruption impact: {impact['total_impact']}")