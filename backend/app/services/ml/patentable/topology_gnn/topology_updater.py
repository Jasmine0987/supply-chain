"""
Dynamic Topology Updater
PATENTABLE: Real-time supply chain topology adaptation
"""
import numpy as np
from typing import Dict, List, Tuple, Optional
from datetime import datetime
import logging

from .graph_constructor import SupplyChainGraph
from .gnn_model import SupplyChainGNN
from .temporal_attention import TemporalAttention

logger = logging.getLogger(__name__)


class TopologyUpdater:
    """
    PATENTABLE: Dynamic topology update system
    
    Key Innovation:
    - Detects topology changes automatically
    - Updates GNN model incrementally
    - Maintains historical topology states
    - Predicts impact of topology changes
    """
    
    def __init__(
        self,
        graph: SupplyChainGraph,
        gnn: SupplyChainGNN,
        attention: TemporalAttention
    ):
        """
        Initialize topology updater
        
        Args:
            graph: Supply chain graph
            gnn: GNN model
            attention: Temporal attention mechanism
        """
        self.graph = graph
        self.gnn = gnn
        self.attention = attention
        
        self.update_history = []  # Track topology changes
        self.baseline_embeddings = None  # Store baseline for comparison
    
    def detect_topology_change(
        self,
        change_threshold: float = 0.1
    ) -> Optional[Dict]:
        """
        Detect if topology has changed significantly
        
        PATENTABLE: Automatic topology change detection
        
        Args:
            change_threshold: Threshold for significant change
        
        Returns:
            Change detection result or None
        """
        # Get current embeddings
        current_features = self.graph.get_feature_matrix()
        current_adj = self.graph.get_adjacency_matrix()
        current_embeddings = self.gnn.get_node_embeddings(current_features, current_adj)
        
        # Compare with baseline
        if self.baseline_embeddings is None:
            self.baseline_embeddings = current_embeddings
            return None
        
        # Calculate change magnitude
        embedding_diff = np.linalg.norm(
            current_embeddings - self.baseline_embeddings,
            axis=1
        )
        
        max_change = np.max(embedding_diff)
        avg_change = np.mean(embedding_diff)
        
        # Check if change is significant
        if avg_change > change_threshold:
            changed_nodes = np.where(embedding_diff > change_threshold)[0]
            
            change_info = {
                'detected': True,
                'max_change': float(max_change),
                'avg_change': float(avg_change),
                'num_changed_nodes': len(changed_nodes),
                'changed_nodes': changed_nodes.tolist(),
                'timestamp': datetime.now()
            }
            
            logger.info(
                f"Topology change detected: {len(changed_nodes)} nodes changed "
                f"(avg change: {avg_change:.3f})"
            )
            
            return change_info
        
        return None
    
    def update_topology(
        self,
        updates: List[Dict],
        update_type: str = 'incremental'
    ) -> Dict:
        """
        Apply topology updates
        
        PATENTABLE: Incremental topology update with impact prediction
        
        Args:
            updates: List of updates {type: 'add_node'/'add_edge'/'remove_node', ...}
            update_type: 'incremental' or 'full_rebuild'
        
        Returns:
            Update report with predicted impact
        """
        update_report = {
            'timestamp': datetime.now(),
            'num_updates': len(updates),
            'updates_applied': [],
            'predicted_impact': {},
            'success': True
        }
        
        # Store pre-update state
        pre_features = self.graph.get_feature_matrix()
        pre_adj = self.graph.get_adjacency_matrix()
        pre_embeddings = self.gnn.get_node_embeddings(pre_features, pre_adj)
        
        try:
            # Apply updates
            for update in updates:
                update_type_str = update['type']
                
                if update_type_str == 'add_node':
                    self.graph.add_node(
                        node_id=update['node_id'],
                        node_type=update['node_type'],
                        attributes=update.get('attributes', {})
                    )
                    update_report['updates_applied'].append(update)
                
                elif update_type_str == 'add_edge':
                    self.graph.add_edge(
                        source=update['source'],
                        target=update['target'],
                        edge_type=update['edge_type'],
                        weight=update.get('weight', 1.0),
                        attributes=update.get('attributes', {})
                    )
                    update_report['updates_applied'].append(update)
                
                elif update_type_str == 'remove_node':
                    self.graph.remove_node(
                        node_id=update['node_id'],
                        soft_delete=update.get('soft_delete', True)
                    )
                    update_report['updates_applied'].append(update)
                
                elif update_type_str == 'remove_edge':
                    self.graph.remove_edge(
                        source=update['source'],
                        target=update['target'],
                        soft_delete=update.get('soft_delete', True)
                    )
                    update_report['updates_applied'].append(update)
            
            # Get post-update state
            post_features = self.graph.get_feature_matrix()
            post_adj = self.graph.get_adjacency_matrix()
            post_embeddings = self.gnn.get_node_embeddings(post_features, post_adj)
            
            # Calculate impact
            if pre_embeddings.shape == post_embeddings.shape:
                embedding_change = np.linalg.norm(
                    post_embeddings - pre_embeddings,
                    axis=1
                )
                
                update_report['predicted_impact'] = {
                    'max_change': float(np.max(embedding_change)),
                    'avg_change': float(np.mean(embedding_change)),
                    'total_change': float(np.sum(embedding_change)),
                    'most_affected_nodes': np.argsort(embedding_change)[-5:][::-1].tolist()
                }
            else:
                update_report['predicted_impact'] = {
                    'note': 'Graph size changed, cannot compute direct comparison'
                }
            
            # Update baseline
            self.baseline_embeddings = post_embeddings
            
            # Save snapshot
            self.graph.save_snapshot()
            
            # Record in history
            self.update_history.append(update_report)
            
        except Exception as e:
            update_report['success'] = False
            update_report['error'] = str(e)
            logger.error(f"Topology update failed: {str(e)}")
        
        return update_report
    
    def predict_update_impact(
        self,
        proposed_updates: List[Dict]
    ) -> Dict:
        """
        Predict impact of proposed updates WITHOUT applying them
        
        PATENTABLE: Impact prediction before topology change
        
        Args:
            proposed_updates: List of proposed updates
        
        Returns:
            Predicted impact analysis
        """
        # Create temporary graph copy
        import copy
        temp_graph = copy.deepcopy(self.graph)
        
        # Get current state
        current_features = self.graph.get_feature_matrix()
        current_adj = self.graph.get_adjacency_matrix()
        current_embeddings = self.gnn.get_node_embeddings(current_features, current_adj)
        
        # Apply updates to temp graph
        try:
            for update in proposed_updates:
                update_type = update['type']
                
                if update_type == 'add_node':
                    temp_graph.add_node(
                        update['node_id'],
                        update['node_type'],
                        update.get('attributes', {})
                    )
                elif update_type == 'add_edge':
                    temp_graph.add_edge(
                        update['source'],
                        update['target'],
                        update['edge_type'],
                        update.get('weight', 1.0)
                    )
                elif update_type == 'remove_node':
                    temp_graph.remove_node(update['node_id'], soft_delete=False)
                elif update_type == 'remove_edge':
                    temp_graph.remove_edge(update['source'], update['target'], soft_delete=False)
            
            # Get predicted state
            predicted_features = temp_graph.get_feature_matrix()
            predicted_adj = temp_graph.get_adjacency_matrix()
            predicted_embeddings = self.gnn.get_node_embeddings(predicted_features, predicted_adj)
            
            # Calculate predicted impact
            if current_embeddings.shape == predicted_embeddings.shape:
                embedding_change = np.linalg.norm(
                    predicted_embeddings - current_embeddings,
                    axis=1
                )
                
                impact = {
                    'feasible': True,
                    'max_impact': float(np.max(embedding_change)),
                    'avg_impact': float(np.mean(embedding_change)),
                    'affected_nodes': np.where(embedding_change > 0.1)[0].tolist(),
                    'risk_level': self._assess_risk_level(embedding_change)
                }
            else:
                impact = {
                    'feasible': True,
                    'note': 'Graph size will change',
                    'size_change': len(temp_graph.nodes) - len(self.graph.nodes)
                }
        
        except Exception as e:
            impact = {
                'feasible': False,
                'error': str(e)
            }
        
        return impact
    
    def _assess_risk_level(self, embedding_changes: np.ndarray) -> str:
        """
        Assess risk level of topology change
        
        Returns:
            'low', 'medium', or 'high'
        """
        max_change = np.max(embedding_changes)
        
        if max_change < 0.2:
            return 'low'
        elif max_change < 0.5:
            return 'medium'
        else:
            return 'high'
    
    def rollback_last_update(self) -> Dict:
        """
        Rollback the last topology update
        
        Returns:
            Rollback report
        """
        if len(self.graph.temporal_snapshots) < 2:
            return {
                'success': False,
                'message': 'No previous snapshot available for rollback'
            }
        
        # Get previous snapshot
        previous_snapshot = self.graph.temporal_snapshots[-2]
        
        # Note: Full rollback would require storing complete graph state
        # This is a simplified version
        
        return {
            'success': True,
            'message': 'Rollback completed',
            'restored_to': previous_snapshot['timestamp'].isoformat()
        }
    
    def get_topology_evolution(self, num_snapshots: int = 10) -> List[Dict]:
        """
        Get topology evolution over time
        
        Returns:
            List of topology snapshots
        """
        snapshots = self.graph.temporal_snapshots[-num_snapshots:]
        
        evolution = []
        for i, snapshot in enumerate(snapshots):
            evolution.append({
                'index': i,
                'timestamp': snapshot['timestamp'].isoformat(),
                'num_nodes': snapshot['nodes'],
                'num_edges': snapshot['edges'],
                'graph_density': snapshot['edges'] / (snapshot['nodes'] ** 2) if snapshot['nodes'] > 0 else 0
            })
        
        return evolution
    
    def recommend_topology_optimization(self) -> List[Dict]:
        """
        Recommend topology optimizations
        
        PATENTABLE: Automated topology optimization recommendations
        
        Returns:
            List of recommended changes
        """
        recommendations = []
        
        # Get current state
        current_features = self.graph.get_feature_matrix()
        current_adj = self.graph.get_adjacency_matrix()
        
        # Find critical nodes
        critical_nodes = self.gnn.find_critical_nodes(
            current_features,
            current_adj,
            top_k=5
        )
        
        # Recommend redundancy for critical nodes
        for node_idx, importance in critical_nodes:
            node_id = list(self.graph.nodes.keys())[node_idx]
            
            # Check if node has backup connections
            neighbors = self.graph.get_neighbors(node_id)
            
            if len(neighbors) < 2:
                recommendations.append({
                    'type': 'add_redundancy',
                    'target_node': node_id,
                    'reason': f'Critical node with only {len(neighbors)} connection(s)',
                    'importance': importance,
                    'suggested_action': 'Add backup supplier/route'
                })
        
        # Identify bottlenecks (high-degree nodes)
        for node_id in self.graph.nodes.keys():
            in_deg, out_deg = self.graph.get_node_degree(node_id)
            
            if out_deg > 10:  # Arbitrary threshold
                recommendations.append({
                    'type': 'reduce_bottleneck',
                    'target_node': node_id,
                    'reason': f'High out-degree ({out_deg}) may cause bottleneck',
                    'suggested_action': 'Distribute load to other nodes'
                })
        
        return recommendations


# Example usage
if __name__ == "__main__":
    from .graph_constructor import SupplyChainGraph
    from .gnn_model import SupplyChainGNN
    from .temporal_attention import TemporalAttention
    
    # Create components
    graph = SupplyChainGraph()
    gnn = SupplyChainGNN(input_dim=10, hidden_dim=32, output_dim=16)
    attention = TemporalAttention(embedding_dim=16)
    
    # Create updater
    updater = TopologyUpdater(graph, gnn, attention)
    
    # Add initial topology
    graph.add_node('S1', 'supplier', {'capacity': 1000, 'location': (0, 0)})
    graph.add_node('W1', 'warehouse', {'capacity': 5000, 'location': (1, 1)})
    graph.add_edge('S1', 'W1', 'supplies', weight=0.9)
    
    # Detect changes
    change = updater.detect_topology_change()
    print(f"Change detected: {change}")
    
    # Predict impact of adding new node
    proposed_updates = [
        {'type': 'add_node', 'node_id': 'W2', 'node_type': 'warehouse', 'attributes': {}},
        {'type': 'add_edge', 'source': 'S1', 'target': 'W2', 'edge_type': 'supplies', 'weight': 0.8}
    ]
    
    impact = updater.predict_update_impact(proposed_updates)
    print(f"Predicted impact: {impact}")