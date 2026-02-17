import random
import numpy as np
from typing import List, Tuple, Callable, Optional, Dict
from dataclasses import dataclass


@dataclass
class Route:
    """Represents a route solution"""
    path: List[int]
    distance: float
    
    def __lt__(self, other):
        return self.distance < other.distance


class GeneticAlgorithmTSP:
    """Genetic Algorithm for solving Traveling Salesman Problem"""
    
    def __init__(
        self,
        distance_matrix: np.ndarray,
        population_size: int = 100,
        elite_size: int = 20,
        mutation_rate: float = 0.01,
        generations: int = 500
    ):
        self.distance_matrix = distance_matrix
        self.n_locations = len(distance_matrix)
        self.population_size = population_size
        self.elite_size = elite_size
        self.mutation_rate = mutation_rate
        self.generations = generations
        self.best_route: Optional[Route] = None
        self.history: List[float] = []
    
    def calculate_route_distance(self, route: List[int]) -> float:
        """Calculate total distance for a route"""
        distance = 0
        for i in range(len(route)):
            from_idx = route[i]
            to_idx = route[(i + 1) % len(route)]
            distance += self.distance_matrix[from_idx][to_idx]
        return distance
    
    def create_initial_population(self) -> List[Route]:
        """Create initial random population"""
        population = []
        
        for _ in range(self.population_size):
            route = list(range(self.n_locations))
            random.shuffle(route)
            distance = self.calculate_route_distance(route)
            population.append(Route(route, distance))
        
        return population
    
    def rank_routes(self, population: List[Route]) -> List[Route]:
        """Sort population by fitness (distance)"""
        return sorted(population)
    
    def selection(self, ranked_pop: List[Route]) -> List[Route]:
        """Select parents for breeding using tournament selection"""
        selected = []
        
        # Keep elite
        selected.extend(ranked_pop[:self.elite_size])
        
        # Tournament selection for rest
        tournament_size = min(5, len(ranked_pop))  # Safety check
        while len(selected) < self.population_size:
            tournament = random.sample(ranked_pop, tournament_size)
            winner = min(tournament, key=lambda x: x.distance)
            selected.append(winner)
        
        return selected
    
    def crossover(self, parent1: Route, parent2: Route) -> Route:
        """
        Order crossover (OX) for TSP
        ✅ FIXED: Added bounds checking to prevent index out of range
        """
        size = len(parent1.path)
        
        # Safety check
        if size < 2:
            return Route(parent1.path.copy(), parent1.distance)
        
        # Select random segment
        start = random.randint(0, size - 2)
        end = random.randint(start + 1, size)
        
        # Copy segment from parent1
        child_path = [-1] * size
        child_path[start:end] = parent1.path[start:end]
        
        # Fill remaining from parent2
        current_pos = end % size  # ✅ Use modulo to wrap around
        
        for gene in parent2.path[end:] + parent2.path[:end]:
            if gene not in child_path:
                # ✅ CRITICAL FIX: Check bounds before accessing
                while current_pos < size and child_path[current_pos] != -1:
                    current_pos += 1
                
                # ✅ Wrap around if needed
                if current_pos >= size:
                    current_pos = 0
                    while current_pos < size and child_path[current_pos] != -1:
                        current_pos += 1
                
                # ✅ Safety: If somehow still can't find spot, break
                if current_pos >= size:
                    break
                    
                child_path[current_pos] = gene
        
        # ✅ Fill any remaining -1s (shouldn't happen, but safety)
        if -1 in child_path:
            remaining = [g for g in parent1.path if g not in child_path]
            for i, val in enumerate(child_path):
                if val == -1 and remaining:
                    child_path[i] = remaining.pop(0)
        
        distance = self.calculate_route_distance(child_path)
        return Route(child_path, distance)
    
    def mutate(self, route: Route) -> Route:
        """Swap mutation"""
        if random.random() < self.mutation_rate:
            path = route.path.copy()
            if len(path) >= 2:  # Safety check
                idx1, idx2 = random.sample(range(len(path)), 2)
                path[idx1], path[idx2] = path[idx2], path[idx1]
                distance = self.calculate_route_distance(path)
                return Route(path, distance)
        return route
    
    def breed_population(self, selected: List[Route]) -> List[Route]:
        """Create next generation through crossover and mutation"""
        children = []
        
        # Keep elite unchanged
        children.extend(selected[:self.elite_size])
        
        # Breed rest of population
        pool_size = min(50, len(selected))  # Safety check
        pool = selected[:pool_size]
        
        while len(children) < self.population_size:
            if len(pool) >= 2:  # Safety check
                parent1, parent2 = random.sample(pool, 2)
                child = self.crossover(parent1, parent2)
                child = self.mutate(child)
                children.append(child)
            else:
                # Fallback: clone from pool
                children.append(random.choice(pool))
        
        return children[:self.population_size]  # Ensure exact size
    
    def optimize(self, verbose: bool = True) -> Route:
        """
        Run genetic algorithm optimization
        
        Args:
            verbose: Print progress
            
        Returns:
            Best route found
        """
        # Initialize
        population = self.create_initial_population()
        
        for generation in range(self.generations):
            # Rank population
            ranked_pop = self.rank_routes(population)
            
            # Track best
            best = ranked_pop[0]
            self.history.append(best.distance)
            
            if verbose and generation % 50 == 0:
                print(f"Generation {generation}: Best distance = {best.distance:.2f}")
            
            # Check for convergence
            if generation > 100:
                recent_improvement = self.history[-100] - self.history[-1]
                if recent_improvement < 0.01:
                    if verbose:
                        print(f"Converged at generation {generation}")
                    break
            
            # Selection
            selected = self.selection(ranked_pop)
            
            # Breed new generation
            population = self.breed_population(selected)
        
        # Return best route
        self.best_route = self.rank_routes(population)[0]
        return self.best_route
    
    def get_route_details(self, locations: List[str]) -> Dict:
        """Get detailed route information"""
        if not self.best_route:
            raise ValueError("No route optimized yet. Call optimize() first.")
        
        route_names = [locations[i] for i in self.best_route.path]
        
        segments = []
        for i in range(len(self.best_route.path)):
            from_idx = self.best_route.path[i]
            to_idx = self.best_route.path[(i + 1) % len(self.best_route.path)]
            
            segments.append({
                'from': locations[from_idx],
                'to': locations[to_idx],
                'distance': float(self.distance_matrix[from_idx][to_idx])
            })
        
        return {
            'route': route_names,
            'total_distance': float(self.best_route.distance),
            'segments': segments,
            'num_stops': len(route_names)
        }


# Example usage
if __name__ == "__main__":
    # Sample distance matrix (5 locations)
    distance_matrix = np.array([
        [0, 10, 15, 20, 25],
        [10, 0, 35, 25, 30],
        [15, 35, 0, 30, 20],
        [20, 25, 30, 0, 15],
        [25, 30, 20, 15, 0]
    ])
    
    locations = ["Warehouse", "Stop A", "Stop B", "Stop C", "Stop D"]
    
    # Run GA
    ga = GeneticAlgorithmTSP(
        distance_matrix=distance_matrix,
        population_size=100,
        generations=500
    )
    
    best_route = ga.optimize(verbose=True)
    details = ga.get_route_details(locations)
    
    print(f"\nBest Route: {' -> '.join(details['route'])}")
    print(f"Total Distance: {details['total_distance']:.2f}")