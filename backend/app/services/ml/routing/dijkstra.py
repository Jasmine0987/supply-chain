import heapq
from typing import Dict, List, Tuple, Optional
import numpy as np


class DijkstraRouter:
    """Dijkstra's algorithm for shortest path routing"""
    
    def __init__(self):
        self.graph: Dict[str, List[Tuple[str, float]]] = {}
        self.nodes: List[str] = []
    
    def add_edge(self, from_node: str, to_node: str, distance: float):
        """
        Add edge to graph
        
        Args:
            from_node: Starting node
            to_node: Destination node
            distance: Distance/cost between nodes
        """
        if from_node not in self.graph:
            self.graph[from_node] = []
            self.nodes.append(from_node)
        
        if to_node not in self.nodes:
            self.nodes.append(to_node)
        
        self.graph[from_node].append((to_node, distance))
    
    def build_from_distance_matrix(
        self,
        locations: List[str],
        distance_matrix: np.ndarray
    ):
        """
        Build graph from distance matrix
        
        Args:
            locations: List of location names
            distance_matrix: NxN matrix of distances
        """
        n = len(locations)
        for i in range(n):
            for j in range(n):
                if i != j and distance_matrix[i][j] > 0:
                    self.add_edge(
                        locations[i],
                        locations[j],
                        distance_matrix[i][j]
                    )
    
    def shortest_path(
        self,
        start: str,
        end: str
    ) -> Tuple[List[str], float]:
        """
        Find shortest path using Dijkstra's algorithm
        
        Args:
            start: Starting location
            end: Destination location
            
        Returns:
            Tuple of (path, total_distance)
        """
        if start not in self.graph:
            raise ValueError(f"Start node '{start}' not in graph")
        
        # Priority queue: (distance, node, path)
        pq = [(0, start, [start])]
        visited = set()
        distances = {start: 0}
        
        while pq:
            current_dist, current_node, path = heapq.heappop(pq)
            
            if current_node in visited:
                continue
            
            visited.add(current_node)
            
            # Found destination
            if current_node == end:
                return path, current_dist
            
            # Check neighbors
            if current_node in self.graph:
                for neighbor, weight in self.graph[current_node]:
                    if neighbor not in visited:
                        new_dist = current_dist + weight
                        
                        if neighbor not in distances or new_dist < distances[neighbor]:
                            distances[neighbor] = new_dist
                            heapq.heappush(
                                pq,
                                (new_dist, neighbor, path + [neighbor])
                            )
        
        # No path found
        return [], float('inf')
    
    def all_pairs_shortest_path(self) -> Dict[Tuple[str, str], Tuple[List[str], float]]:
        """
        Calculate shortest paths between all pairs of nodes
        
        Returns:
            Dictionary mapping (start, end) to (path, distance)
        """
        all_paths = {}
        
        for start in self.nodes:
            for end in self.nodes:
                if start != end:
                    path, distance = self.shortest_path(start, end)
                    all_paths[(start, end)] = (path, distance)
        
        return all_paths
    
    def k_shortest_paths(
        self,
        start: str,
        end: str,
        k: int = 3
    ) -> List[Tuple[List[str], float]]:
        """
        Find k shortest paths (Yen's algorithm approximation)
        
        Args:
            start: Starting location
            end: Destination location
            k: Number of paths to find
            
        Returns:
            List of (path, distance) tuples
        """
        paths = []
        
        # Find first shortest path
        path, distance = self.shortest_path(start, end)
        if path:
            paths.append((path, distance))
        
        # Find alternative paths by removing edges
        for i in range(1, k):
            if not paths:
                break
            
            best_alt_path = None
            best_alt_dist = float('inf')
            
            # Try removing each edge from the best path
            last_path = paths[-1][0]
            for j in range(len(last_path) - 1):
                node_a, node_b = last_path[j], last_path[j + 1]
                
                # Temporarily remove edge
                original_edges = self.graph.get(node_a, []).copy()
                if node_a in self.graph:
                    self.graph[node_a] = [
                        (n, d) for n, d in self.graph[node_a]
                        if n != node_b
                    ]
                
                # Find alternative path
                alt_path, alt_dist = self.shortest_path(start, end)
                
                # Restore edge
                if node_a in self.graph:
                    self.graph[node_a] = original_edges
                
                # Check if this is a new path
                if alt_path and alt_path not in [p[0] for p in paths]:
                    if alt_dist < best_alt_dist:
                        best_alt_path = alt_path
                        best_alt_dist = alt_dist
            
            if best_alt_path:
                paths.append((best_alt_path, best_alt_dist))
        
        return paths


# Example usage
if __name__ == "__main__":
    router = DijkstraRouter()
    
    # Build sample graph
    router.add_edge("A", "B", 4)
    router.add_edge("A", "C", 2)
    router.add_edge("B", "C", 1)
    router.add_edge("B", "D", 5)
    router.add_edge("C", "D", 8)
    router.add_edge("C", "E", 10)
    router.add_edge("D", "E", 2)
    
    # Find shortest path
    path, distance = router.shortest_path("A", "E")
    print(f"Shortest path from A to E: {' -> '.join(path)}")
    print(f"Total distance: {distance}")
    
    # Find alternative paths
    alt_paths = router.k_shortest_paths("A", "E", k=3)
    print(f"\nTop 3 routes:")
    for i, (path, dist) in enumerate(alt_paths, 1):
        print(f"{i}. {' -> '.join(path)} (distance: {dist})")