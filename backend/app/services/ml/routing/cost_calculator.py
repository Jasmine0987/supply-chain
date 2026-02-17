from typing import Dict, List, Optional
from datetime import datetime, timedelta
import numpy as np


class RouteCostCalculator:
    """Calculate comprehensive routing costs"""
    
    def __init__(self):
        # Cost parameters (configurable)
        self.fuel_cost_per_km = 0.15  # USD per km
        self.driver_cost_per_hour = 25.0  # USD per hour
        self.vehicle_maintenance_per_km = 0.10  # USD per km
        self.time_window_penalty = 50.0  # USD per hour late
        self.carbon_cost_per_km = 0.02  # USD carbon offset
        
        # Average speeds by road type (km/h)
        self.speeds = {
            'highway': 80,
            'urban': 40,
            'rural': 60,
            'default': 50
        }
    
    def calculate_route_cost(
        self,
        distance_km: float,
        duration_hours: Optional[float] = None,
        road_type: str = 'default',
        num_stops: int = 0,
        time_windows: Optional[List[Dict]] = None,
        include_carbon: bool = True
    ) -> Dict:
        """
        Calculate comprehensive route cost
        
        Args:
            distance_km: Total distance
            duration_hours: Travel time (estimated if None)
            road_type: Type of road
            num_stops: Number of delivery stops
            time_windows: Delivery time windows
            include_carbon: Include carbon offset cost
            
        Returns:
            Detailed cost breakdown
        """
        # Estimate duration if not provided
        if duration_hours is None:
            speed = self.speeds.get(road_type, self.speeds['default'])
            duration_hours = distance_km / speed
            
            # Add stop time (15 min per stop)
            duration_hours += (num_stops * 0.25)
        
        # Calculate cost components
        fuel_cost = distance_km * self.fuel_cost_per_km
        driver_cost = duration_hours * self.driver_cost_per_hour
        maintenance_cost = distance_km * self.vehicle_maintenance_per_km
        
        # Stop penalties (loading/unloading time)
        stop_cost = num_stops * 10.0  # $10 per stop
        
        # Time window penalties
        window_penalty = 0.0
        if time_windows:
            window_penalty = self._calculate_time_window_penalties(
                duration_hours,
                time_windows
            )
        
        # Carbon cost
        carbon_cost = 0.0
        if include_carbon:
            carbon_cost = distance_km * self.carbon_cost_per_km
        
        total_cost = (
            fuel_cost +
            driver_cost +
            maintenance_cost +
            stop_cost +
            window_penalty +
            carbon_cost
        )
        
        return {
            'total_cost': round(total_cost, 2),
            'breakdown': {
                'fuel': round(fuel_cost, 2),
                'driver': round(driver_cost, 2),
                'maintenance': round(maintenance_cost, 2),
                'stops': round(stop_cost, 2),
                'time_window_penalty': round(window_penalty, 2),
                'carbon_offset': round(carbon_cost, 2)
            },
            'metrics': {
                'distance_km': round(distance_km, 2),
                'duration_hours': round(duration_hours, 2),
                'cost_per_km': round(total_cost / distance_km, 2),
                'num_stops': num_stops
            }
        }
    
    def compare_routes(
        self,
        routes: List[Dict]
    ) -> Dict:
        """
        Compare multiple route options
        
        Args:
            routes: List of route dictionaries with distance and metadata
            
        Returns:
            Comparison results
        """
        comparisons = []
        
        for i, route in enumerate(routes):
            cost_analysis = self.calculate_route_cost(
                distance_km=route['distance_km'],
                duration_hours=route.get('duration_hours'),
                road_type=route.get('road_type', 'default'),
                num_stops=route.get('num_stops', 0),
                time_windows=route.get('time_windows')
            )
            
            comparisons.append({
                'route_id': i,
                'route_name': route.get('name', f'Route {i+1}'),
                **cost_analysis
            })
        
        # Find best route
        best_route = min(comparisons, key=lambda x: x['total_cost'])
        
        # Calculate savings vs worst route
        worst_cost = max(c['total_cost'] for c in comparisons)
        best_savings = worst_cost - best_route['total_cost']
        
        return {
            'routes': comparisons,
            'recommendation': {
                'best_route': best_route['route_name'],
                'best_cost': best_route['total_cost'],
                'savings_vs_worst': round(best_savings, 2),
                'savings_percentage': round((best_savings / worst_cost) * 100, 2)
            }
        }
    
    def calculate_multi_vehicle_cost(
        self,
        shipments: List[Dict],
        vehicle_capacity: int = 100,
        vehicle_cost_per_day: float = 200.0
    ) -> Dict:
        """
        Calculate cost for multi-vehicle routing
        
        Args:
            shipments: List of shipments with volumes
            vehicle_capacity: Capacity per vehicle
            vehicle_cost_per_day: Fixed cost per vehicle per day
            
        Returns:
            Multi-vehicle cost analysis
        """
        total_volume = sum(s.get('volume', 1) for s in shipments)
        vehicles_needed = int(np.ceil(total_volume / vehicle_capacity))
        
        # Calculate per-vehicle costs
        distance_per_vehicle = sum(s.get('distance', 0) for s in shipments) / vehicles_needed
        
        single_vehicle_cost = self.calculate_route_cost(
            distance_km=distance_per_vehicle,
            num_stops=len(shipments) // vehicles_needed
        )
        
        total_variable_cost = single_vehicle_cost['total_cost'] * vehicles_needed
        total_fixed_cost = vehicle_cost_per_day * vehicles_needed
        total_cost = total_variable_cost + total_fixed_cost
        
        return {
            'vehicles_needed': vehicles_needed,
            'total_cost': round(total_cost, 2),
            'cost_per_vehicle': round(total_cost / vehicles_needed, 2),
            'fixed_costs': round(total_fixed_cost, 2),
            'variable_costs': round(total_variable_cost, 2),
            'cost_per_shipment': round(total_cost / len(shipments), 2),
            'utilization': round((total_volume / (vehicles_needed * vehicle_capacity)) * 100, 2)
        }
    
    def _calculate_time_window_penalties(
        self,
        actual_duration: float,
        time_windows: List[Dict]
    ) -> float:
        """Calculate penalties for missing delivery windows"""
        penalty = 0.0
        
        for window in time_windows:
            latest_time = window.get('latest_time')
            if latest_time:
                delay = max(0, actual_duration - latest_time)
                penalty += delay * self.time_window_penalty
        
        return penalty
    
    def optimize_vehicle_count(
        self,
        shipments: List[Dict],
        max_vehicles: int = 10
    ) -> Dict:
        """
        Find optimal number of vehicles
        
        Args:
            shipments: List of shipments
            max_vehicles: Maximum vehicles available
            
        Returns:
            Optimization results
        """
        results = []
        
        for num_vehicles in range(1, max_vehicles + 1):
            # Simulate cost with different vehicle counts
            shipments_per_vehicle = len(shipments) / num_vehicles
            
            avg_distance = sum(s.get('distance', 50) for s in shipments) / num_vehicles
            
            cost_analysis = self.calculate_multi_vehicle_cost(
                shipments=shipments,
                vehicle_capacity=100,
                vehicle_cost_per_day=200.0
            )
            
            results.append({
                'num_vehicles': num_vehicles,
                'total_cost': cost_analysis['total_cost'],
                'cost_per_shipment': cost_analysis['cost_per_shipment'],
                'utilization': cost_analysis['utilization']
            })
        
        # Find optimal
        optimal = min(results, key=lambda x: x['total_cost'])
        
        return {
            'optimal_vehicles': optimal['num_vehicles'],
            'optimal_cost': optimal['total_cost'],
            'all_scenarios': results
        }