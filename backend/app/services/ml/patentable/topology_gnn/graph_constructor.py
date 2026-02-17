"""
Supply Chain Graph Constructor
PATENTABLE: Dynamic supply chain topology representation
"""
import numpy as np
from typing import Dict, List, Tuple, Optional, Set
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class SupplyChainGraph:
    """
    PATENTABLE: Dynamic supply chain topology graph
    
    Key Innovation:
    - Represents supply chain as temporal graph
    - Captures relationships: suppliers, warehouses, customers, routes
    - Supports dynamic topology updates
    - Includes node features and edge weights
    """
    
    def __init__(self):
        self.nodes = {}  # node_id -> node_data
        self.edges = {}  # (source, target) -> edge_data
        self.node_types = ['supplier', 'warehouse', 'distributor', 'customer', 'route']
        self.edge_types = ['supplies', 'ships_to', 'delivers_to', 'connects']
        
        self.adjacency_list = {}  # node_id -> [neighbor_ids]
        self.reverse_adjacency = {}  # node_id -> [parent_ids]
        
        self.node_features = {}  # node_id -> feature_vector
        self.edge_features = {}  # (source, target) -> feature_vector
        
        self.temporal_snapshots = []  # List of graph states over time
    
    def add_node(
        self,
        node_id: str,
        node_type: str,
        attributes: Dict = None,
        features: np.ndarray = None
    ):
        """
        Add node to supply chain graph
        
        Args:
            node_id: Unique node identifier
            node_type: Type of node (supplier, warehouse, etc.)
            attributes: Node attributes (location, capacity, etc.)
            features: Feature vector for GNN
        """
        if node_type not in self.node_types:
            logger.warning(f"Unknown node type: {node_type}")
        
        self.nodes[node_id] = {
            'id': node_id,
            'type': node_type,
            'attributes': attributes or {},
            'added_at': datetime.now(),
            'active': True
        }
        
        # Initialize adjacency lists
        if node_id not in self.adjacency_list:
            self.adjacency_list[node_id] = []
        if node_id not in self.reverse_adjacency:
            self.reverse_adjacency[node_id] = []
        
        # Set features
        if features is not None:
            self.node_features[node_id] = features
        else:
            # Default feature vector
            self.node_features[node_id] = self._create_default_features(node_type, attributes)
        
        logger.info(f"Added node: {node_id} (type: {node_type})")
    
    def add_edge(
        self,
        source: str,
        target: str,
        edge_type: str,
        weight: float = 1.0,
        attributes: Dict = None,
        features: np.ndarray = None
    ):
        """
        Add edge between nodes
        
        Args:
            source: Source node ID
            target: Target node ID
            edge_type: Type of relationship
            weight: Edge weight (cost, distance, capacity)
            attributes: Edge attributes
            features: Feature vector for GNN
        """
        if source not in self.nodes:
            raise ValueError(f"Source node {source} does not exist")
        if target not in self.nodes:
            raise ValueError(f"Target node {target} does not exist")
        
        self.edges[(source, target)] = {
            'source': source,
            'target': target,
            'type': edge_type,
            'weight': weight,
            'attributes': attributes or {},
            'added_at': datetime.now(),
            'active': True
        }
        
        # Update adjacency lists
        if target not in self.adjacency_list[source]:
            self.adjacency_list[source].append(target)
        if source not in self.reverse_adjacency[target]:
            self.reverse_adjacency[target].append(source)
        
        # Set edge features
        if features is not None:
            self.edge_features[(source, target)] = features
        else:
            self.edge_features[(source, target)] = np.array([weight])
        
        logger.info(f"Added edge: {source} -> {target} (type: {edge_type}, weight: {weight})")
    
    def remove_node(self, node_id: str, soft_delete: bool = True):
        """
        Remove node from graph
        
        Args:
            node_id: Node to remove
            soft_delete: If True, mark as inactive instead of deleting
        """
        if node_id not in self.nodes:
            return
        
        if soft_delete:
            self.nodes[node_id]['active'] = False
        else:
            # Remove node and all connected edges
            del self.nodes[node_id]
            
            # Remove from adjacency lists
            for neighbor in self.adjacency_list.get(node_id, []):
                if node_id in self.reverse_adjacency.get(neighbor, []):
                    self.reverse_adjacency[neighbor].remove(node_id)
            
            for parent in self.reverse_adjacency.get(node_id, []):
                if node_id in self.adjacency_list.get(parent, []):
                    self.adjacency_list[parent].remove(node_id)
            
            del self.adjacency_list[node_id]
            del self.reverse_adjacency[node_id]
            
            # Remove edges
            edges_to_remove = [
                (s, t) for (s, t) in self.edges.keys()
                if s == node_id or t == node_id
            ]
            for edge in edges_to_remove:
                del self.edges[edge]
                if edge in self.edge_features:
                    del self.edge_features[edge]
        
        logger.info(f"Removed node: {node_id} (soft_delete: {soft_delete})")
    
    def remove_edge(self, source: str, target: str, soft_delete: bool = True):
        """Remove edge from graph"""
        edge_key = (source, target)
        
        if edge_key not in self.edges:
            return
        
        if soft_delete:
            self.edges[edge_key]['active'] = False
        else:
            del self.edges[edge_key]
            if target in self.adjacency_list.get(source, []):
                self.adjacency_list[source].remove(target)
            if source in self.reverse_adjacency.get(target, []):
                self.reverse_adjacency[target].remove(source)
            if edge_key in self.edge_features:
                del self.edge_features[edge_key]
    
    def get_neighbors(self, node_id: str, include_inactive: bool = False) -> List[str]:
        """Get all neighbors of a node"""
        neighbors = self.adjacency_list.get(node_id, [])
        
        if not include_inactive:
            neighbors = [
                n for n in neighbors
                if self.nodes[n]['active']
            ]
        
        return neighbors
    
    def get_node_degree(self, node_id: str) -> Tuple[int, int]:
        """
        Get node degree
        
        Returns:
            (in_degree, out_degree)
        """
        in_degree = len(self.reverse_adjacency.get(node_id, []))
        out_degree = len(self.adjacency_list.get(node_id, []))
        return in_degree, out_degree
    
    def find_path(
        self,
        source: str,
        target: str,
        max_depth: int = 10
    ) -> Optional[List[str]]:
        """
        Find shortest path between nodes using BFS
        
        Args:
            source: Start node
            target: End node
            max_depth: Maximum path length
        
        Returns:
            Path as list of node IDs, or None if no path exists
        """
        if source not in self.nodes or target not in self.nodes:
            return None
        
        if source == target:
            return [source]
        
        # BFS
        queue = [(source, [source])]
        visited = {source}
        
        while queue:
            current, path = queue.pop(0)
            
            if len(path) > max_depth:
                continue
            
            for neighbor in self.get_neighbors(current):
                if neighbor == target:
                    return path + [neighbor]
                
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append((neighbor, path + [neighbor]))
        
        return None
    
    def _create_default_features(
        self,
        node_type: str,
        attributes: Dict
    ) -> np.ndarray:
        """
        Create default feature vector for a node
        
        Features include:
        - One-hot encoding of node type
        - Capacity (if applicable)
        - Geographic coordinates
        - Operational metrics
        """
        features = []
        
        # Node type (one-hot)
        type_encoding = [1 if t == node_type else 0 for t in self.node_types]
        features.extend(type_encoding)
        
        # Capacity
        features.append(attributes.get('capacity', 0))
        
        # Location (lat, lon)
        location = attributes.get('location', (0, 0))
        features.extend(location)
        
        # Current stock/inventory
        features.append(attributes.get('current_stock', 0))
        
        # Utilization rate
        features.append(attributes.get('utilization', 0))
        
        return np.array(features, dtype=np.float32)
    
    def get_adjacency_matrix(self) -> np.ndarray:
        """
        Get adjacency matrix representation
        
        Returns:
            NxN adjacency matrix
        """
        n = len(self.nodes)
        node_to_idx = {node_id: idx for idx, node_id in enumerate(self.nodes.keys())}
        
        adj_matrix = np.zeros((n, n))
        
        for (source, target), edge_data in self.edges.items():
            if edge_data['active']:
                i = node_to_idx[source]
                j = node_to_idx[target]
                adj_matrix[i, j] = edge_data['weight']
        
        return adj_matrix
    
    def get_feature_matrix(self) -> np.ndarray:
        """
        Get node feature matrix
        
        Returns:
            NxD feature matrix (N nodes, D features)
        """
        node_ids = list(self.nodes.keys())
        features = [self.node_features[nid] for nid in node_ids]
        return np.stack(features)
    
    def save_snapshot(self):
        """Save current graph state as temporal snapshot"""
        snapshot = {
            'timestamp': datetime.now(),
            'nodes': len([n for n in self.nodes.values() if n['active']]),
            'edges': len([e for e in self.edges.values() if e['active']]),
            'adjacency_matrix': self.get_adjacency_matrix(),
            'feature_matrix': self.get_feature_matrix()
        }
        self.temporal_snapshots.append(snapshot)
    
    def get_graph_statistics(self) -> Dict:
        """Get graph statistics"""
        active_nodes = [n for n in self.nodes.values() if n['active']]
        active_edges = [e for e in self.edges.values() if e['active']]
        
        # Calculate centrality measures
        degrees = [len(self.adjacency_list.get(nid, [])) for nid in self.nodes.keys()]
        
        return {
            'total_nodes': len(active_nodes),
            'total_edges': len(active_edges),
            'nodes_by_type': {
                node_type: len([n for n in active_nodes if n['type'] == node_type])
                for node_type in self.node_types
            },
            'avg_degree': np.mean(degrees) if degrees else 0,
            'max_degree': np.max(degrees) if degrees else 0,
            'graph_density': len(active_edges) / (len(active_nodes) ** 2) if active_nodes else 0
        }


# Example usage
if __name__ == "__main__":
    # Create supply chain graph
    graph = SupplyChainGraph()
    
    # Add nodes
    graph.add_node('SUP001', 'supplier', {'capacity': 1000, 'location': (40.7, -74.0)})
    graph.add_node('WH001', 'warehouse', {'capacity': 5000, 'location': (34.0, -118.2)})
    graph.add_node('WH002', 'warehouse', {'capacity': 3000, 'location': (41.8, -87.6)})
    graph.add_node('CUST001', 'customer', {'location': (37.7, -122.4)})
    
    # Add edges
    graph.add_edge('SUP001', 'WH001', 'supplies', weight=0.8)
    graph.add_edge('SUP001', 'WH002', 'supplies', weight=0.6)
    graph.add_edge('WH001', 'CUST001', 'delivers_to', weight=0.9)
    graph.add_edge('WH002', 'CUST001', 'delivers_to', weight=0.7)
    
    # Find path
    path = graph.find_path('SUP001', 'CUST001')
    print(f"Path from SUP001 to CUST001: {path}")
    
    # Get statistics
    stats = graph.get_graph_statistics()
    print(f"Graph statistics: {stats}")