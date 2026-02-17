import api from '../../services/api';

export interface AnomalyDetectionRequest {
  product_sku?: string;
  warehouse_id?: number;
  sensor_id?: number;
  method: 'isolation_forest' | 'z_score' | 'iqr' | 'mad' | 'ensemble';
  contamination?: number;
  days?: number;
  threshold?: number;
}

export interface Anomaly {
  index?: number;
  date: string;
  value: number;
  anomaly_score?: number;
  z_score?: number;
  severity: string;
  [key: string]: any;
}

export interface AnomalyResponse {
  method: string;
  total_samples: number;
  anomalies_detected: number;
  anomaly_percentage: number;
  anomalies: Anomaly[];
  severity_distribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  generated_at: string;
}

export const anomalyAPI = {
  detectAnomalies: (data: AnomalyDetectionRequest) =>
    api.post<AnomalyResponse>('/api/v1/anomaly/detect', data),

  trainModel: (data: {
    data_source: string;
    method: string;
    contamination?: number;
    historical_days?: number;
  }) => api.post('/api/v1/anomaly/train', data),

  checkSensorThreshold: (params: {
    sensor_id: number;
    sensor_type: string;
    value: number;
  }) => api.post('/api/v1/anomaly/check-sensor-threshold', null, { params }),

  getStatistics: (days: number = 30) =>
    api.get('/api/v1/anomaly/statistics', { params: { days } }),
};