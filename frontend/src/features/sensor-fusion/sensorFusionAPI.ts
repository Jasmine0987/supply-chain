import api from '../../services/api';

export interface SensorReading {
  sensor_type: 'temperature' | 'humidity' | 'shock' | 'vibration' | 'gps';
  timestamp: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface ProcessShipmentRequest {
  shipment_id: string;
  sensor_data: Array<Record<string, any>>;
}

export interface RealTimeAnalysisRequest {
  sensor_readings: Record<string, number>;
}

export interface TrainModelRequest {
  historical_data: Array<Record<string, any>>;
  method?: string;
}

export interface CalibrateModelRequest {
  training_data: Array<Record<string, any>>;
  actual_damages: boolean[];
}

export const sensorFusionAPI = {
  // Initialization
  initialize: (data?: TrainModelRequest) =>
    api.post('/api/v1/sensor-fusion/initialize', data || {}),

  // Sensor readings
  addSensorReading: (data: SensorReading) =>
    api.post('/api/v1/sensor-fusion/sensor/add', data),

  addSensorBatch: (readings: SensorReading[]) =>
    api.post('/api/v1/sensor-fusion/sensor/batch', readings),

  // Shipment processing
  processShipment: (data: ProcessShipmentRequest) =>
    api.post('/api/v1/sensor-fusion/shipment/process', data),

  getShipmentReport: (shipmentId: string) =>
    api.get(`/api/v1/sensor-fusion/shipment/${shipmentId}`),

  // Real-time analysis
  analyzeRealtime: (data: RealTimeAnalysisRequest) =>
    api.post('/api/v1/sensor-fusion/analyze/realtime', data),

  // Causal graph
  getCausalGraph: () =>
    api.get('/api/v1/sensor-fusion/causal-graph'),

  // System
  getSystemHealth: () =>
    api.get('/api/v1/sensor-fusion/health'),

  getStatistics: () =>
    api.get('/api/v1/sensor-fusion/statistics'),

  // Calibration
  calibrateModel: (data: CalibrateModelRequest) =>
    api.post('/api/v1/sensor-fusion/calibrate', data),
};