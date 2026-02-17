import api from '../../services/api';

export const topologyGNNAPI = {
  initialize: (data?: any) => api.post('/api/v1/topology-gnn/initialize', data),
  addEntity: (data: any) => api.post('/api/v1/topology-gnn/entity/add', data),
  addConnection: (data: any) => api.post('/api/v1/topology-gnn/connection/add', data),
  analyzeSupplyChain: () => api.get('/api/v1/topology-gnn/analyze'),
  predictDisruption: (data: any) => api.post('/api/v1/topology-gnn/disruption/predict', data),
  findAlternativeRoutes: (data: any) => api.post('/api/v1/topology-gnn/routes/alternative', data),
  recordEvent: (data: any) => api.post('/api/v1/topology-gnn/event/record', data),
  predictFutureDisruptions: (data: any) => api.post('/api/v1/topology-gnn/disruption/predict-future', data),
  getInsights: () => api.get('/api/v1/topology-gnn/insights'),
  getStatus: () => api.get('/api/v1/topology-gnn/status'),
  getStatistics: () => api.get('/api/v1/topology-gnn/statistics'),
};
