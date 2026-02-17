import api from '../../services/api';

export interface RegisterWarehouseRequest {
  warehouse_id: string;
  capacity: number;
  current_stock: number;
  latitude: number;
  longitude: number;
  demand_priority?: number;
}

export interface LoadDemandHistoryRequest {
  product_id: string;
  warehouse_id: string;
  demand_history: number[];
}

export interface GenerateAllocationRequest {
  product_id: string;
  total_inventory: number;
  warehouse_ids: string[];
  forecast_days?: number;
  allocation_strategy?: 'nash_equilibrium' | 'proportional' | 'safety_stock';
}

export interface CheckReallocationRequest {
  product_id: string;
  actual_demands: Record<string, number[]>;
}

export interface CompareStrategiesRequest {
  product_id: string;
  total_inventory: number;
  warehouse_ids: string[];
  strategies?: string[];
}

export const probabilisticInventoryAPI = {
  // Warehouse management
  registerWarehouse: (data: RegisterWarehouseRequest) =>
    api.post('/api/v1/probabilistic-inventory/warehouses/register', data),

  // Demand data
  loadDemandHistory: (data: LoadDemandHistoryRequest) =>
    api.post('/api/v1/probabilistic-inventory/demand/load', data),

  // Allocation
  generateAllocation: (data: GenerateAllocationRequest) =>
    api.post('/api/v1/probabilistic-inventory/allocate', data),

  getAllocationSummary: (productId: string) =>
    api.get(`/api/v1/probabilistic-inventory/allocation/${productId}`),

  // Reallocation
  checkReallocation: (data: CheckReallocationRequest) =>
    api.post('/api/v1/probabilistic-inventory/reallocate', data),

  getReallocationHistory: (productId?: string, days?: number) =>
    api.get('/api/v1/probabilistic-inventory/reallocation-history', {
      params: { product_id: productId, days }
    }),

  // Strategy comparison
  compareStrategies: (data: CompareStrategiesRequest) =>
    api.post('/api/v1/probabilistic-inventory/compare-strategies', data),

  // Forecasts
  getForecastDetail: (productId: string, warehouseId: string) =>
    api.get(`/api/v1/probabilistic-inventory/forecast/${productId}/${warehouseId}`),

  getConfidenceBands: (productId: string, warehouseId: string) =>
    api.get(`/api/v1/probabilistic-inventory/confidence-bands/${productId}/${warehouseId}`),

  // System
  getSystemHealth: () =>
    api.get('/api/v1/probabilistic-inventory/health'),

  getStatistics: () =>
    api.get('/api/v1/probabilistic-inventory/statistics'),
};