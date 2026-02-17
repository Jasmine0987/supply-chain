import api from '../../services/api';

export interface CreateDeviceRequest {
  device_id: string;
  device_type: 'iot_sensor' | 'raspberry_pi' | 'jetson_nano' | 'smartphone';
}

export interface PartitionRequest {
  device_id: string;
  network_type: 'cnn' | 'lstm' | 'transformer';
  objective: 'latency' | 'energy' | 'cost' | 'balanced';
  constraints?: Record<string, any>;
}

export interface AdaptiveRepartitionRequest {
  device_id: string;
  current_partition: number;
  objective: 'latency' | 'energy' | 'cost' | 'balanced';
}

export const edgeCloudAPI = {
  // Device management
  createDevice: (data: CreateDeviceRequest) =>
    api.post('/api/v1/edge-cloud/devices', data),

  listDevices: () => api.get('/api/v1/edge-cloud/devices'),

  getDeviceMetrics: (deviceId: string) =>
    api.get(`/api/v1/edge-cloud/devices/${deviceId}`),

  updateDeviceState: (deviceId: string) =>
    api.post(`/api/v1/edge-cloud/devices/${deviceId}/update`),

  // Network analysis
  analyzeNetwork: (networkType: string) =>
    api.get(`/api/v1/edge-cloud/networks/${networkType}/analyze`),

  // Partitioning
  optimizePartition: (data: PartitionRequest) =>
    api.post('/api/v1/edge-cloud/partition/optimize', data),

  adaptiveRepartition: (data: AdaptiveRepartitionRequest) =>
    api.post('/api/v1/edge-cloud/partition/adaptive', data),

  comparePartitions: (data: any) =>
    api.post('/api/v1/edge-cloud/partition/compare', data),

  // Statistics
  getStatistics: () => api.get('/api/v1/edge-cloud/statistics'),
};