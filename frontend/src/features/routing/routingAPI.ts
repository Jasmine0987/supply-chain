import api from '../../services/api';

export interface Location {
  name: string;
  address?: string;
  coordinates: [number, number];
  volume?: number;
  time_window?: any;
}

export interface RouteOptimizationRequest {
  start_location: string;
  end_location: string;
  waypoints: string[];
  locations: Location[];
  method?: 'genetic' | 'dijkstra';
  optimize_for?: 'distance' | 'cost' | 'time';
}

export interface RouteConstraints {
  vehicle_capacity?: number;
  max_distance_km?: number;
  max_duration_hours?: number;
  include_carbon?: boolean;
  road_type?: 'highway' | 'urban' | 'rural' | 'default';
}

export interface OptimizedRoute {
  route_id: number;
  locations: string[];
  distance_km: number;
  estimated_duration_hours: number;
  total_cost: number;
  cost_breakdown: Record<string, number>;
  segments: Array<{
    from_location: string;
    to_location: string;
    distance_km: number;
  }>;
  num_stops: number;
}

// ✅ OPTION 2: Export individual functions (if you want to use * as api)
export const optimizeRoute = (data: RouteOptimizationRequest) =>
  api.post('/api/v1/routing/optimize', data);

export const optimizeWithConstraints = (data: {
  locations: Location[];
  constraints: RouteConstraints;
}) => api.post('/api/v1/routing/optimize-with-constraints', data);

export const compareRoutes = (routes: any[]) =>
  api.post('/api/v1/routing/compare-routes', { routes });

export const optimizeMultiVehicle = (data: {
  shipments: any[];
  vehicle_capacity?: number;
  vehicle_cost_per_day?: number;
}) => api.post('/api/v1/routing/multi-vehicle', data);

export const optimizeFleetSize = (shipments: any[], max_vehicles: number = 10) =>
  api.post('/api/v1/routing/optimize-fleet', null, {
    params: { max_vehicles },
    data: shipments,
  });

export const estimateCost = (params: {
  distance_km: number;
  num_stops?: number;
  road_type?: string;
  include_carbon?: boolean;
}) => api.get('/api/v1/routing/cost-estimate', { params });

// ✅ Also export as object for backwards compatibility
export const routingAPI = {
  optimizeRoute,
  optimizeWithConstraints,
  compareRoutes,
  optimizeMultiVehicle,
  optimizeFleetSize,
  estimateCost,
};