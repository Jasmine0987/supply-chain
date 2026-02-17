import api from '../../services/api';

export interface TimeTravelQuery {
  entity_type: string;
  entity_id: number;
  as_of_time: string;
}

export interface ShipmentJourneyQuery {
  shipment_id: number;
  as_of_time?: string;
}

export interface EventCorrelationQuery {
  event_type_1: string;
  event_type_2: string;
  max_time_diff_hours?: number;
}

export const temporalGraphAPI = {
  // Initialize graph
  initialize: () => api.post('/api/v1/temporal-graph/initialize'),

  // Sync data
  syncFromDatabase: (limit: number = 100) =>
    api.post(`/api/v1/temporal-graph/sync-from-database?limit=${limit}`),

  // Time-travel query
  timeTravelQuery: (data: TimeTravelQuery) =>
    api.post('/api/v1/temporal-graph/time-travel', data),

  // Causal chain
  findCausalChain: (eventId: string, maxDepth: number = 5) =>
    api.get(`/api/v1/temporal-graph/causal-chain/${eventId}`, {
      params: { max_depth: maxDepth },
    }),

  // Shipment journey
  getShipmentJourney: (data: ShipmentJourneyQuery) =>
    api.post('/api/v1/temporal-graph/shipment-journey', data),

  // Event patterns
  analyzeEventPatterns: (eventType: string, days: number = 30) =>
    api.get(`/api/v1/temporal-graph/event-patterns/${eventType}`, {
      params: { time_window_days: days },
    }),

  // Event correlations
  findEventCorrelations: (data: EventCorrelationQuery) =>
    api.post('/api/v1/temporal-graph/event-correlations', data),

  // Statistics
  getStatistics: () => api.get('/api/v1/temporal-graph/statistics'),
};