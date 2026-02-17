from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import numpy as np
import logging
import traceback

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.routing import (
    RouteOptimizationRequest,
    OptimizeWithConstraintsRequest,
    OptimizedRoute,
    RouteComparisonRequest,
    RouteComparisonResponse,
    MultiVehicleRequest
)
from app.services.ml.routing.route_optimizer import RouteOptimizer
from app.services.ml.routing.cost_calculator import RouteCostCalculator

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/optimize")
async def optimize_route(
    request: RouteOptimizationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Optimize delivery route
    
    Finds the most efficient route through multiple waypoints using
    genetic algorithm or Dijkstra's algorithm.
    """
    try:
        logger.info(f"🚗 Route optimization request from user {current_user.username}")
        logger.info(f"   Method: {request.method}")
        logger.info(f"   Waypoints: {len(request.waypoints)}")
        
        # Build distance matrix
        all_locations = [request.start_location] + request.waypoints + [request.end_location]
        n = len(all_locations)
        distance_matrix = np.zeros((n, n))
        
        # Create location lookup
        location_map = {loc.name: loc for loc in request.locations}
        
        # Calculate distances
        optimizer = RouteOptimizer()
        for i in range(n):
            for j in range(n):
                if i != j:
                    loc1 = location_map[all_locations[i]]
                    loc2 = location_map[all_locations[j]]
                    
                    distance = optimizer._calculate_distance(
                        loc1.coordinates,
                        loc2.coordinates
                    )
                    distance_matrix[i][j] = distance
        
        logger.info(f"   Distance matrix built: {n}x{n}")
        
        # Optimize route
        result = optimizer.optimize_single_route(
            start=request.start_location,
            end=request.end_location,
            waypoints=request.waypoints,
            distance_matrix=distance_matrix,
            method=request.method
        )
        
        # Calculate costs
        cost_calculator = RouteCostCalculator()
        cost_analysis = cost_calculator.calculate_route_cost(
            distance_km=result['total_distance'],
            num_stops=len(request.waypoints)
        )
        
        logger.info(f"✅ Optimization complete: {result['total_distance']:.2f}km, ${cost_analysis['total_cost']:.2f}")
        
        return {
            **result,
            'cost_analysis': cost_analysis,
            'optimization_method': request.method
        }
        
    except KeyError as e:
        logger.error(f"❌ KeyError in optimize_route: {str(e)}")
        logger.error(f"   Available locations: {[loc.name for loc in request.locations]}")
        logger.error(f"   Requested: start={request.start_location}, end={request.end_location}, waypoints={request.waypoints}")
        logger.error(f"Traceback:\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=400,
            detail=f"Location not found: {str(e)}. Make sure all locations are defined in the locations list."
        )
    except Exception as e:
        logger.error(f"❌ Error in optimize_route: {str(e)}")
        logger.error(f"Traceback:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/optimize-with-constraints")
async def optimize_with_constraints(
    request: OptimizeWithConstraintsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Optimize route with real-world constraints
    
    Considers vehicle capacity, time windows, and other operational constraints.
    """
    try:
        logger.info(f"🚚 Constrained optimization request from user {current_user.username}")
        logger.info(f"   Locations: {len(request.locations)}")
        logger.info(f"   Vehicle capacity: {request.constraints.vehicle_capacity}")
        
        optimizer = RouteOptimizer()
        
        # Convert to dict format
        locations = [loc.dict() for loc in request.locations]
        constraints = request.constraints.dict()
        
        logger.info(f"   Total volume: {sum(loc.get('volume', 0) for loc in locations)}")
        
        result = optimizer.optimize_with_constraints(
            locations=locations,
            constraints=constraints
        )
        
        logger.info(f"✅ Optimization complete: {result['total_vehicles_needed']} vehicles needed")
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Error in optimize_with_constraints: {str(e)}")
        logger.error(f"Traceback:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/compare-routes", response_model=RouteComparisonResponse)
async def compare_routes(
    request: RouteComparisonRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Compare multiple route options
    
    Analyzes cost, distance, and time for different route alternatives.
    """
    try:
        logger.info(f"📊 Route comparison request from user {current_user.username}")
        logger.info(f"   Comparing {len(request.routes)} routes")
        
        cost_calculator = RouteCostCalculator()
        comparison = cost_calculator.compare_routes(request.routes)
        
        logger.info(f"✅ Comparison complete: Best route saves ${comparison['recommendation']['savings_vs_worst']:.2f}")
        
        return RouteComparisonResponse(**comparison)
        
    except Exception as e:
        logger.error(f"❌ Error in compare_routes: {str(e)}")
        logger.error(f"Traceback:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/multi-vehicle")
async def optimize_multi_vehicle(
    request: MultiVehicleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Calculate multi-vehicle routing costs
    
    Determines optimal number of vehicles and routing for fleet operations.
    """
    try:
        logger.info(f"🚛 Multi-vehicle optimization request from user {current_user.username}")
        logger.info(f"   Shipments: {len(request.shipments)}")
        logger.info(f"   Vehicle capacity: {request.vehicle_capacity}")
        
        cost_calculator = RouteCostCalculator()
        
        result = cost_calculator.calculate_multi_vehicle_cost(
            shipments=request.shipments,
            vehicle_capacity=request.vehicle_capacity,
            vehicle_cost_per_day=request.vehicle_cost_per_day
        )
        
        logger.info(f"✅ Multi-vehicle optimization complete: {result['vehicles_needed']} vehicles")
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Error in optimize_multi_vehicle: {str(e)}")
        logger.error(f"Traceback:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/optimize-fleet")
async def optimize_fleet_size(
    shipments: List[dict],
    max_vehicles: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Optimize fleet size
    
    Finds the optimal number of vehicles to minimize total costs.
    """
    try:
        logger.info(f"🚐 Fleet optimization request from user {current_user.username}")
        logger.info(f"   Shipments: {len(shipments)}, Max vehicles: {max_vehicles}")
        
        cost_calculator = RouteCostCalculator()
        
        result = cost_calculator.optimize_vehicle_count(
            shipments=shipments,
            max_vehicles=max_vehicles
        )
        
        logger.info(f"✅ Fleet optimization complete: {result['optimal_vehicles']} vehicles optimal")
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Error in optimize_fleet_size: {str(e)}")
        logger.error(f"Traceback:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cost-estimate")
async def estimate_route_cost(
    distance_km: float,
    num_stops: int = 0,
    road_type: str = "default",
    include_carbon: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get quick cost estimate
    
    Provides cost breakdown for a given distance and number of stops.
    """
    try:
        logger.info(f"💰 Cost estimate request from user {current_user.username}")
        logger.info(f"   Distance: {distance_km}km, Stops: {num_stops}")
        
        cost_calculator = RouteCostCalculator()
        
        result = cost_calculator.calculate_route_cost(
            distance_km=distance_km,
            num_stops=num_stops,
            road_type=road_type,
            include_carbon=include_carbon
        )
        
        logger.info(f"✅ Cost estimate: ${result['total_cost']:.2f}")
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Error in estimate_route_cost: {str(e)}")
        logger.error(f"Traceback:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))