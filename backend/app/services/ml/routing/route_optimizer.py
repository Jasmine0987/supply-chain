from typing import Dict, List, Optional, Tuple
import numpy as np
from datetime import datetime
import logging

from app.services.ml.routing.dijkstra import DijkstraRouter
from app.services.ml.routing.genetic_algorithm import GeneticAlgorithmTSP
from app.services.ml.routing.cost_calculator import RouteCostCalculator

logger = logging.getLogger(__name__)


class RouteOptimizer:
    """Main route optimization service"""
    
    def __init__(self):
        self.cost_calculator = RouteCostCalculator()
    
    def optimize_single_route(
        self,
        start: str,
        end: str,
        waypoints: List[str],
        distance_matrix: np.ndarray,
        method: str = 'genetic'
    ) -> Dict:
        """
        Optimize route with multiple waypoints
        
        Args:
            start: Starting location
            end: End location
            waypoints: Intermediate stops
            distance_matrix: Distance matrix for all locations
            method: 'genetic' or 'dijkstra'
            
        Returns:
            Optimized route details
        """
        try:
            all_locations = [start] + waypoints + [end]
            
            if method == 'genetic':
                logger.info(f"Optimizing route using genetic algorithm: {len(all_locations)} locations")
                # Use GA for TSP
                ga = GeneticAlgorithmTSP(
                    distance_matrix=distance_matrix,
                    population_size=100,
                    generations=300
                )
                best_route = ga.optimize(verbose=False)
                route_details = ga.get_route_details(all_locations)
                
                logger.info(f"Route optimized: distance={route_details['total_distance']:.2f}km")
                
                return {
                    'method': 'genetic_algorithm',
                    'route': route_details['route'],
                    'total_distance': route_details['total_distance'],
                    'segments': route_details['segments'],
                    'optimization_complete': True
                }
            
            elif method == 'dijkstra':
                logger.info(f"Optimizing route using Dijkstra: {len(all_locations)} locations")
                # Use Dijkstra for shortest path
                router = DijkstraRouter()
                router.build_from_distance_matrix(all_locations, distance_matrix)
                
                # Build complete route through waypoints
                complete_path = [start]
                total_distance = 0
                segments = []
                
                current = start
                remaining = waypoints + [end]
                
                while remaining:
                    # Find nearest unvisited location
                    nearest = None
                    nearest_dist = float('inf')
                    nearest_path = []
                    
                    for location in remaining:
                        path, dist = router.shortest_path(current, location)
                        if dist < nearest_dist:
                            nearest = location
                            nearest_dist = dist
                            nearest_path = path
                    
                    # Add to route
                    complete_path.extend(nearest_path[1:])
                    total_distance += nearest_dist
                    
                    segments.append({
                        'from': current,
                        'to': nearest,
                        'distance': nearest_dist
                    })
                    
                    current = nearest
                    remaining.remove(nearest)
                
                logger.info(f"Route optimized: distance={total_distance:.2f}km")
                
                return {
                    'method': 'dijkstra',
                    'route': complete_path,
                    'total_distance': total_distance,
                    'segments': segments,
                    'optimization_complete': True
                }
            
            else:
                raise ValueError(f"Unknown method: {method}")
        
        except Exception as e:
            logger.error(f"Error in optimize_single_route: {str(e)}")
            raise
    
    def optimize_with_constraints(
        self,
        locations: List[Dict],
        constraints: Dict
    ) -> Dict:
        """
        Optimize route with real-world constraints
        
        Args:
            locations: List of location dicts with coordinates and time windows
            constraints: Dict with vehicle capacity, time limits, etc.
            
        Returns:
            Optimized route with constraint satisfaction
        """
        try:
            logger.info(f"Optimizing with constraints: {len(locations)} locations")
            logger.info(f"Constraints: {constraints}")
            
            # Build distance matrix
            n = len(locations)
            distance_matrix = np.zeros((n, n))
            
            for i in range(n):
                for j in range(n):
                    if i != j:
                        distance_matrix[i][j] = self._calculate_distance(
                            locations[i]['coordinates'],
                            locations[j]['coordinates']
                        )
            
            logger.info(f"Distance matrix built: {n}x{n}")
            
            # Get base optimization
            location_names = [loc['name'] for loc in locations]
            start_idx = 0  # Assume first is warehouse
            
            ga = GeneticAlgorithmTSP(
                distance_matrix=distance_matrix,
                population_size=150,
                generations=500
            )
            best_route = ga.optimize(verbose=False)
            
            logger.info(f"Base route optimized: {best_route.distance:.2f}km")
            
            # Apply constraints
            route_indices = best_route.path
            
            # Check capacity constraints
            total_volume = sum(locations[i].get('volume', 0) for i in route_indices)
            vehicle_capacity = constraints.get('vehicle_capacity', float('inf'))
            
            logger.info(f"Total volume: {total_volume}, Vehicle capacity: {vehicle_capacity}")
            
            if total_volume > vehicle_capacity:
                logger.info("Splitting route due to capacity constraints")
                # Split into multiple vehicles
                routes = self._split_route_by_capacity(
                    route_indices,
                    locations,
                    vehicle_capacity
                )
                logger.info(f"Route split into {len(routes)} sub-routes")
            else:
                logger.info("Single vehicle sufficient")
                routes = [route_indices]
            
            # Format results
            optimized_routes = []
            for route_idx, route in enumerate(routes):
                route_names = [location_names[i] for i in route]
                route_distance = sum(
                    distance_matrix[route[i]][route[i+1]]
                    for i in range(len(route) - 1)
                )
                
                # Calculate costs
                cost_analysis = self.cost_calculator.calculate_route_cost(
                    distance_km=route_distance,
                    num_stops=len(route) - 1,
                    include_carbon=constraints.get('include_carbon', True)
                )
                
                optimized_routes.append({
                    'route_id': route_idx + 1,
                    'locations': route_names,
                    'distance_km': round(route_distance, 2),
                    'estimated_duration_hours': cost_analysis['metrics']['duration_hours'],
                    'cost_analysis': cost_analysis,
                    'num_stops': len(route) - 1
                })
                
                logger.info(f"Route {route_idx + 1}: {len(route)} stops, {route_distance:.2f}km, ${cost_analysis['total_cost']:.2f}")
            
            return {
                'optimized_routes': optimized_routes,
                'total_vehicles_needed': len(routes),
                'constraints_applied': constraints,
                'optimization_method': 'genetic_algorithm_with_constraints'
            }
        
        except Exception as e:
            logger.error(f"Error in optimize_with_constraints: {str(e)}")
            import traceback
            logger.error(f"Traceback:\n{traceback.format_exc()}")
            raise
    
    def _calculate_distance(
        self,
        coord1: Tuple[float, float],
        coord2: Tuple[float, float]
    ) -> float:
        """Calculate Haversine distance between coordinates"""
        lat1, lon1 = coord1
        lat2, lon2 = coord2
        
        R = 6371  # Earth radius in km
        
        dlat = np.radians(lat2 - lat1)
        dlon = np.radians(lon2 - lon1)
        
        a = (
            np.sin(dlat / 2) ** 2 +
            np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) *
            np.sin(dlon / 2) ** 2
        )
        
        c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
        distance = R * c
        
        return distance
    
    def _split_route_by_capacity(
        self,
        route: List[int],
        locations: List[Dict],
        capacity: float
    ) -> List[List[int]]:
        """
        Split route into multiple sub-routes based on capacity
        
        ⭐ FIXED: Corrected indentation bug
        """
        logger.info(f"Splitting route of {len(route)} stops with capacity {capacity}")
        
        routes = []
        current_route = [route[0]]  # Start with warehouse
        current_volume = 0
        
        for idx in route[1:]:
            volume = locations[idx].get('volume', 0)
            
            if current_volume + volume <= capacity:
                # Can fit in current vehicle
                current_route.append(idx)
                current_volume += volume
            else:
                # Need new vehicle
                current_route.append(route[0])  # Return to warehouse
                routes.append(current_route)
                
                # ✅ FIXED: These lines should be INSIDE the else block
                current_route = [route[0], idx]  # Start new route
                current_volume = volume
        
        # Add last route
        if len(current_route) > 1:
            current_route.append(route[0])
            routes.append(current_route)
        
        logger.info(f"Split into {len(routes)} routes")
        for i, r in enumerate(routes):
            route_volume = sum(locations[idx].get('volume', 0) for idx in r if idx < len(locations))
            logger.info(f"  Route {i+1}: {len(r)} stops, volume={route_volume:.2f}")
        
        return routes