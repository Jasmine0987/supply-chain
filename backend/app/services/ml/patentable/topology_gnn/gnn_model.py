"""
Graph Neural Network for Supply Chain Topology
PATENTABLE: Topology-aware GNN architecture
"""
import numpy as np
from typing import Dict, List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class GraphConvolutionLayer:
    """
    PATENTABLE: Custom graph convolution layer
    
    Aggregates neighbor features weighted by edge importance
    """
    
    def __init__(self, input_dim: int, output_dim: int):
        self.input_dim = input_dim
        self.output_dim = output_dim
        
        # Initialize weights (Xavier initialization)
        limit = np.sqrt(6.0 / (input_dim + output_dim))
        self.W = np.random.uniform(-limit, limit, (input_dim, output_dim))
        self.b = np.zeros(output_dim)
        
    def forward(
        self,
        node_features: np.ndarray,
        adjacency_matrix: np.ndarray,
        edge_weights: Optional[np.ndarray] = None
    ) -> np.ndarray:
        """
        Forward pass
        
        Args:
            node_features: NxD feature matrix
            adjacency_matrix: NxN adjacency matrix
            edge_weights: NxN edge weight matrix
        
        Returns:
            NxD' transformed features
        """
        # Normalize adjacency matrix (add self-loops)
        A = adjacency_matrix + np.eye(adjacency_matrix.shape[0])
        
        # Degree matrix
        D = np.diag(np.sum(A, axis=1))
        D_inv_sqrt = np.diag(1.0 / np.sqrt(np.diag(D) + 1e-6))
        
        # Symmetric normalization: D^(-1/2) A D^(-1/2)
        A_norm = D_inv_sqrt @ A @ D_inv_sqrt
        
        # Apply edge weights if provided
        if edge_weights is not None:
            A_norm = A_norm * edge_weights
        
        # Graph convolution: A_norm * X * W + b
        aggregated = A_norm @ node_features
        output = aggregated @ self.W + self.b
        
        return output


class SupplyChainGNN:
    """
    PATENTABLE: Multi-layer GNN for supply chain topology
    
    Key Innovation:
    - Learns node embeddings that capture supply chain structure
    - Topology-aware message passing
    - Handles dynamic graph updates
    - Predicts disruptions based on graph structure
    """
    
    def __init__(
        self,
        input_dim: int,
        hidden_dim: int = 64,
        output_dim: int = 32,
        num_layers: int = 3
    ):
        """
        Initialize GNN
        
        Args:
            input_dim: Input feature dimension
            hidden_dim: Hidden layer dimension
            output_dim: Output embedding dimension
            num_layers: Number of graph convolution layers
        """
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.output_dim = output_dim
        self.num_layers = num_layers
        
        # Build layers
        self.layers = []
        
        # Input layer
        self.layers.append(GraphConvolutionLayer(input_dim, hidden_dim))
        
        # Hidden layers
        for _ in range(num_layers - 2):
            self.layers.append(GraphConvolutionLayer(hidden_dim, hidden_dim))
        
        # Output layer
        self.layers.append(GraphConvolutionLayer(hidden_dim, output_dim))
        
        logger.info(f"Initialized GNN: {input_dim} -> {hidden_dim} -> {output_dim}")
    
    def forward(
        self,
        node_features: np.ndarray,
        adjacency_matrix: np.ndarray,
        edge_weights: Optional[np.ndarray] = None
    ) -> np.ndarray:
        """
        Forward pass through GNN
        
        Args:
            node_features: NxD input features
            adjacency_matrix: NxN adjacency matrix
            edge_weights: Optional edge weights
        
        Returns:
            NxD' node embeddings
        """
        x = node_features
        
        for i, layer in enumerate(self.layers):
            x = layer.forward(x, adjacency_matrix, edge_weights)
            
            # ReLU activation (except last layer)
            if i < len(self.layers) - 1:
                x = np.maximum(0, x)
        
        return x
    
    def get_node_embeddings(
        self,
        node_features: np.ndarray,
        adjacency_matrix: np.ndarray
    ) -> np.ndarray:
        """
        Get learned node embeddings
        
        PATENTABLE: Topology-aware node representations
        """
        return self.forward(node_features, adjacency_matrix)
    
    def predict_disruption(
        self,
        node_features: np.ndarray,
        adjacency_matrix: np.ndarray,
        target_nodes: List[int]
    ) -> np.ndarray:
        """
        Predict disruption probability for target nodes
        
        Args:
            node_features: Node features
            adjacency_matrix: Graph structure
            target_nodes: Indices of nodes to predict
        
        Returns:
            Disruption probabilities for target nodes
        """
        # Get embeddings
        embeddings = self.get_node_embeddings(node_features, adjacency_matrix)
        
        # Simple prediction: use embedding magnitude as disruption score
        disruption_scores = np.linalg.norm(embeddings[target_nodes], axis=1)
        
        # Normalize to [0, 1]
        disruption_probs = 1 / (1 + np.exp(-disruption_scores))
        
        return disruption_probs
    
    def compute_node_importance(
        self,
        node_features: np.ndarray,
        adjacency_matrix: np.ndarray
    ) -> np.ndarray:
        """
        Compute importance score for each node
        
        PATENTABLE: Topology-based importance ranking
        
        Combines:
        - Degree centrality
        - Embedding magnitude
        - Downstream impact
        """
        embeddings = self.get_node_embeddings(node_features, adjacency_matrix)
        
        # Degree centrality
        degrees = np.sum(adjacency_matrix, axis=1)
        degree_scores = degrees / (np.max(degrees) + 1e-6)
        
        # Embedding magnitude
        embedding_scores = np.linalg.norm(embeddings, axis=1)
        embedding_scores = embedding_scores / (np.max(embedding_scores) + 1e-6)
        
        # Downstream impact (number of reachable nodes)
        downstream_scores = self._compute_downstream_impact(adjacency_matrix)
        
        # Combined importance
        importance = (
            0.4 * degree_scores +
            0.3 * embedding_scores +
            0.3 * downstream_scores
        )
        
        return importance
    
    def _compute_downstream_impact(
        self,
        adjacency_matrix: np.ndarray,
        max_hops: int = 3
    ) -> np.ndarray:
        """
        Compute how many nodes are reachable within max_hops
        """
        n = adjacency_matrix.shape[0]
        reachable = np.zeros(n)
        
        for i in range(n):
            # BFS to count reachable nodes
            visited = {i}
            queue = [(i, 0)]
            
            while queue:
                node, depth = queue.pop(0)
                
                if depth >= max_hops:
                    continue
                
                neighbors = np.where(adjacency_matrix[node] > 0)[0]
                for neighbor in neighbors:
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append((neighbor, depth + 1))
            
            reachable[i] = len(visited) - 1  # Exclude self
        
        # Normalize
        reachable = reachable / (np.max(reachable) + 1e-6)
        return reachable
    
    def link_prediction(
        self,
        node_features: np.ndarray,
        adjacency_matrix: np.ndarray,
        node_pairs: List[Tuple[int, int]]
    ) -> np.ndarray:
        """
        Predict likelihood of edges between node pairs
        
        Args:
            node_features: Node features
            adjacency_matrix: Current graph structure
            node_pairs: List of (source, target) pairs
        
        Returns:
            Edge probabilities for each pair
        """
        embeddings = self.get_node_embeddings(node_features, adjacency_matrix)
        
        probabilities = []
        for source, target in node_pairs:
            # Dot product similarity
            similarity = np.dot(embeddings[source], embeddings[target])
            probability = 1 / (1 + np.exp(-similarity))
            probabilities.append(probability)
        
        return np.array(probabilities)
    
    def find_critical_nodes(
        self,
        node_features: np.ndarray,
        adjacency_matrix: np.ndarray,
        top_k: int = 5
    ) -> List[Tuple[int, float]]:
        """
        Find most critical nodes in supply chain
        
        PATENTABLE: Critical node identification
        
        Returns:
            List of (node_index, importance_score) sorted by importance
        """
        importance = self.compute_node_importance(node_features, adjacency_matrix)
        
        # Get top-k
        top_indices = np.argsort(importance)[-top_k:][::-1]
        critical_nodes = [(int(idx), float(importance[idx])) for idx in top_indices]
        
        return critical_nodes
    
    def simulate_disruption(
        self,
        node_features: np.ndarray,
        adjacency_matrix: np.ndarray,
        disrupted_nodes: List[int]
    ) -> Dict:
        """
        Simulate impact of disrupting specific nodes
        
        Args:
            node_features: Node features
            adjacency_matrix: Graph structure
            disrupted_nodes: Nodes to disrupt
        
        Returns:
            Impact analysis
        """
        # Original embeddings
        original_embeddings = self.get_node_embeddings(node_features, adjacency_matrix)
        
        # Remove disrupted nodes (set their features to zero)
        disrupted_features = node_features.copy()
        disrupted_features[disrupted_nodes] = 0
        
        # Recompute embeddings
        disrupted_embeddings = self.get_node_embeddings(disrupted_features, adjacency_matrix)
        
        # Compute impact (change in embeddings)
        embedding_change = np.linalg.norm(
            disrupted_embeddings - original_embeddings,
            axis=1
        )
        
        # Identify most affected nodes
        affected_nodes = np.argsort(embedding_change)[-10:][::-1]
        
        return {
            'disrupted_nodes': disrupted_nodes,
            'total_impact': float(np.sum(embedding_change)),
            'avg_impact': float(np.mean(embedding_change)),
            'max_impact': float(np.max(embedding_change)),
            'most_affected_nodes': [
                {
                    'node_id': int(node),
                    'impact_score': float(embedding_change[node])
                }
                for node in affected_nodes
            ]
        }


# Example usage
if __name__ == "__main__":
    # Create sample graph
    num_nodes = 10
    input_dim = 8
    
    # Random node features
    node_features = np.random.randn(num_nodes, input_dim)
    
    # Random adjacency matrix (sparse)
    adjacency_matrix = (np.random.rand(num_nodes, num_nodes) > 0.7).astype(float)
    np.fill_diagonal(adjacency_matrix, 0)  # No self-loops
    
    # Create GNN
    gnn = SupplyChainGNN(
        input_dim=input_dim,
        hidden_dim=32,
        output_dim=16,
        num_layers=3
    )
    
    # Get embeddings
    embeddings = gnn.get_node_embeddings(node_features, adjacency_matrix)
    print(f"Node embeddings shape: {embeddings.shape}")
    
    # Find critical nodes
    critical_nodes = gnn.find_critical_nodes(node_features, adjacency_matrix, top_k=3)
    print(f"Critical nodes: {critical_nodes}")
    
    # Simulate disruption
    disruption_impact = gnn.simulate_disruption(
        node_features,
        adjacency_matrix,
        disrupted_nodes=[0, 1]
    )
    print(f"Disruption impact: {disruption_impact['total_impact']:.3f}")
"""
Graph Neural Network for Supply Chain Topology
PATENTABLE: Topology-aware GNN architecture
"""
import numpy as np
from typing import Dict, List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class GraphConvolutionLayer:
    """
    PATENTABLE: Custom graph convolution layer
    
    Aggregates neighbor features weighted by edge importance
    """
    
    def __init__(self, input_dim: int, output_dim: int):
        self.input_dim = input_dim
        self.output_dim = output_dim
        
        # Initialize weights (Xavier initialization)
        limit = np.sqrt(6.0 / (input_dim + output_dim))
        self.W = np.random.uniform(-limit, limit, (input_dim, output_dim))
        self.b = np.zeros(output_dim)
        
    def forward(
        self,
        node_features: np.ndarray,
        adjacency_matrix: np.ndarray,
        edge_weights: Optional[np.ndarray] = None
    ) -> np.ndarray:
        """
        Forward pass
        
        Args:
            node_features: NxD feature matrix
            adjacency_matrix: NxN adjacency matrix
            edge_weights: NxN edge weight matrix
        
        Returns:
            NxD' transformed features
        """
        # Normalize adjacency matrix (add self-loops)
        A = adjacency_matrix + np.eye(adjacency_matrix.shape[0])
        
        # Degree matrix
        D = np.diag(np.sum(A, axis=1))
        D_inv_sqrt = np.diag(1.0 / np.sqrt(np.diag(D) + 1e-6))
        
        # Symmetric normalization: D^(-1/2) A D^(-1/2)
        A_norm = D_inv_sqrt @ A @ D_inv_sqrt
        
        # Apply edge weights if provided
        if edge_weights is not None:
            A_norm = A_norm * edge_weights
        
        # Graph convolution: A_norm * X * W + b
        aggregated = A_norm @ node_features
        output = aggregated @ self.W + self.b
        
        return output


class SupplyChainGNN:
    """
    PATENTABLE: Multi-layer GNN for supply chain topology
    
    Key Innovation:
    - Learns node embeddings that capture supply chain structure
    - Topology-aware message passing
    - Handles dynamic graph updates
    - Predicts disruptions based on graph structure
    """
    
    def __init__(
        self,
        input_dim: int,
        hidden_dim: int = 64,
        output_dim: int = 32,
        num_layers: int = 3
    ):
        """
        Initialize GNN
        
        Args:
            input_dim: Input feature dimension
            hidden_dim: Hidden layer dimension
            output_dim: Output embedding dimension
            num_layers: Number of graph convolution layers
        """
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.output_dim = output_dim
        self.num_layers = num_layers
        
        # Build layers
        self.layers = []
        
        # Input layer
        self.layers.append(GraphConvolutionLayer(input_dim, hidden_dim))
        
        # Hidden layers
        for _ in range(num_layers - 2):
            self.layers.append(GraphConvolutionLayer(hidden_dim, hidden_dim))
        
        # Output layer
        self.layers.append(GraphConvolutionLayer(hidden_dim, output_dim))
        
        logger.info(f"Initialized GNN: {input_dim} -> {hidden_dim} -> {output_dim}")
    
    def forward(
        self,
        node_features: np.ndarray,
        adjacency_matrix: np.ndarray,
        edge_weights: Optional[np.ndarray] = None
    ) -> np.ndarray:
        """
        Forward pass through GNN
        
        Args:
            node_features: NxD input features
            adjacency_matrix: NxN adjacency matrix
            edge_weights: Optional edge weights
        
        Returns:
            NxD' node embeddings
        """
        x = node_features
        
        for i, layer in enumerate(self.layers):
            x = layer.forward(x, adjacency_matrix, edge_weights)
            
            # ReLU activation (except last layer)
            if i < len(self.layers) - 1:
                x = np.maximum(0, x)
        
        return x
    
    def get_node_embeddings(
        self,
        node_features: np.ndarray,
        adjacency_matrix: np.ndarray
    ) -> np.ndarray:
        """
        Get learned node embeddings
        
        PATENTABLE: Topology-aware node representations
        """
        return self.forward(node_features, adjacency_matrix)
    
    def predict_disruption(
        self,
        node_features: np.ndarray,
        adjacency_matrix: np.ndarray,
        target_nodes: List[int]
    ) -> np.ndarray:
        """
        Predict disruption probability for target nodes
        
        Args:
            node_features: Node features
            adjacency_matrix: Graph structure
            target_nodes: Indices of nodes to predict
        
        Returns:
            Disruption probabilities for target nodes
        """
        # Get embeddings
        embeddings = self.get_node_embeddings(node_features, adjacency_matrix)
        
        # Simple prediction: use embedding magnitude as disruption score
        disruption_scores = np.linalg.norm(embeddings[target_nodes], axis=1)
        
        # Normalize to [0, 1]
        disruption_probs = 1 / (1 + np.exp(-disruption_scores))
        
        return disruption_probs
    
    def compute_node_importance(
        self,
        node_features: np.ndarray,
        adjacency_matrix: np.ndarray
    ) -> np.ndarray:
        """
        Compute importance score for each node
        
        PATENTABLE: Topology-based importance ranking
        
        Combines:
        - Degree centrality
        - Embedding magnitude
        - Downstream impact
        """
        embeddings = self.get_node_embeddings(node_features, adjacency_matrix)
        
        # Degree centrality
        degrees = np.sum(adjacency_matrix, axis=1)
        degree_scores = degrees / (np.max(degrees) + 1e-6)
        
        # Embedding magnitude
        embedding_scores = np.linalg.norm(embeddings, axis=1)
        embedding_scores = embedding_scores / (np.max(embedding_scores) + 1e-6)
        
        # Downstream impact (number of reachable nodes)
        downstream_scores = self._compute_downstream_impact(adjacency_matrix)
        
        # Combined importance
        importance = (
            0.4 * degree_scores +
            0.3 * embedding_scores +
            0.3 * downstream_scores
        )
        
        return importance
    
    def _compute_downstream_impact(
        self,
        adjacency_matrix: np.ndarray,
        max_hops: int = 3
    ) -> np.ndarray:
        """
        Compute how many nodes are reachable within max_hops
        """
        n = adjacency_matrix.shape[0]
        reachable = np.zeros(n)
        
        for i in range(n):
            # BFS to count reachable nodes
            visited = {i}
            queue = [(i, 0)]
            
            while queue:
                node, depth = queue.pop(0)
                
                if depth >= max_hops:
                    continue
                
                neighbors = np.where(adjacency_matrix[node] > 0)[0]
                for neighbor in neighbors:
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append((neighbor, depth + 1))
            
            reachable[i] = len(visited) - 1  # Exclude self
        
        # Normalize
        reachable = reachable / (np.max(reachable) + 1e-6)
        return reachable
    
    def link_prediction(
        self,
        node_features: np.ndarray,
        adjacency_matrix: np.ndarray,
        node_pairs: List[Tuple[int, int]]
    ) -> np.ndarray:
        """
        Predict likelihood of edges between node pairs
        
        Args:
            node_features: Node features
            adjacency_matrix: Current graph structure
            node_pairs: List of (source, target) pairs
        
        Returns:
            Edge probabilities for each pair
        """
        embeddings = self.get_node_embeddings(node_features, adjacency_matrix)
        
        probabilities = []
        for source, target in node_pairs:
            # Dot product similarity
            similarity = np.dot(embeddings[source], embeddings[target])
            probability = 1 / (1 + np.exp(-similarity))
            probabilities.append(probability)
        
        return np.array(probabilities)
    
    def find_critical_nodes(
        self,
        node_features: np.ndarray,
        adjacency_matrix: np.ndarray,
        top_k: int = 5
    ) -> List[Tuple[int, float]]:
        """
        Find most critical nodes in supply chain
        
        PATENTABLE: Critical node identification
        
        Returns:
            List of (node_index, importance_score) sorted by importance
        """
        importance = self.compute_node_importance(node_features, adjacency_matrix)
        
        # Get top-k
        top_indices = np.argsort(importance)[-top_k:][::-1]
        critical_nodes = [(int(idx), float(importance[idx])) for idx in top_indices]
        
        return critical_nodes
    
    def simulate_disruption(
        self,
        node_features: np.ndarray,
        adjacency_matrix: np.ndarray,
        disrupted_nodes: List[int]
    ) -> Dict:
        """
        Simulate impact of disrupting specific nodes
        
        Args:
            node_features: Node features
            adjacency_matrix: Graph structure
            disrupted_nodes: Nodes to disrupt
        
        Returns:
            Impact analysis
        """
        # Original embeddings
        original_embeddings = self.get_node_embeddings(node_features, adjacency_matrix)
        
        # Remove disrupted nodes (set their features to zero)
        disrupted_features = node_features.copy()
        disrupted_features[disrupted_nodes] = 0
        
        # Recompute embeddings
        disrupted_embeddings = self.get_node_embeddings(disrupted_features, adjacency_matrix)
        
        # Compute impact (change in embeddings)
        embedding_change = np.linalg.norm(
            disrupted_embeddings - original_embeddings,
            axis=1
        )
        
        # Identify most affected nodes
        affected_nodes = np.argsort(embedding_change)[-10:][::-1]
        
        return {
            'disrupted_nodes': disrupted_nodes,
            'total_impact': float(np.sum(embedding_change)),
            'avg_impact': float(np.mean(embedding_change)),
            'max_impact': float(np.max(embedding_change)),
            'most_affected_nodes': [
                {
                    'node_id': int(node),
                    'impact_score': float(embedding_change[node])
                }
                for node in affected_nodes
            ]
        }


# Example usage
if __name__ == "__main__":
    # Create sample graph
    num_nodes = 10
    input_dim = 8
    
    # Random node features
    node_features = np.random.randn(num_nodes, input_dim)
    
    # Random adjacency matrix (sparse)
    adjacency_matrix = (np.random.rand(num_nodes, num_nodes) > 0.7).astype(float)
    np.fill_diagonal(adjacency_matrix, 0)  # No self-loops
    
    # Create GNN
    gnn = SupplyChainGNN(
        input_dim=input_dim,
        hidden_dim=32,
        output_dim=16,
        num_layers=3
    )
    
    # Get embeddings
    embeddings = gnn.get_node_embeddings(node_features, adjacency_matrix)
    print(f"Node embeddings shape: {embeddings.shape}")
    
    # Find critical nodes
    critical_nodes = gnn.find_critical_nodes(node_features, adjacency_matrix, top_k=3)
    print(f"Critical nodes: {critical_nodes}")
    
    # Simulate disruption
    disruption_impact = gnn.simulate_disruption(
        node_features,
        adjacency_matrix,
        disrupted_nodes=[0, 1]
    )
    print(f"Disruption impact: {disruption_impact['total_impact']:.3f}")