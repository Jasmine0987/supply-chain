import api from '../../services/api';

export interface TrainModelRequest {
  product_sku?: string;
  warehouse_id?: number;
  model_type: 'prophet' | 'arima' | 'ensemble';
  historical_days?: number;
}

export interface ForecastRequest {
  forecast_type: string;
  product_sku?: string;
  warehouse_id?: number;
  model_type: 'prophet' | 'arima' | 'ensemble';
  forecast_horizon?: number;
}

export interface Prediction {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
}

export interface ForecastResponse {
  forecast_type: string;
  model_type: string;
  product_sku?: string;
  warehouse_id?: number;
  predictions: Prediction[];
  metrics: {
    mae: number;
    mape: number;
    rmse: number;
    r2?: number;
  };
  generated_at: string;
}

export interface AnomalyDetectionRequest {
  product_sku?: string;
  warehouse_id?: number;
  threshold?: number;
  days?: number;
}

export interface Anomaly {
  date: string;
  actual: number;
  predicted: number;
  lower_bound: number;
  upper_bound: number;
  severity: number;
}

export const forecastingAPI = {
  // Train a new model
  trainModel: (data: TrainModelRequest) =>
    api.post('/api/v1/forecasting/train', data),

  // Generate forecast
  generateForecast: (data: ForecastRequest) =>
    api.post<ForecastResponse>('/api/v1/forecasting/predict', data),

  // Get historical forecasts
  getForecasts: (params?: {
    skip?: number;
    limit?: number;
    product_sku?: string;
    warehouse_id?: number;
    forecast_type?: string;
  }) => api.get('/api/v1/forecasting/forecasts', { params }),

  // Detect anomalies
  detectAnomalies: (data: AnomalyDetectionRequest) =>
    api.post('/api/v1/forecasting/detect-anomalies', data),

  // Compare models
  compareModels: (data: {
    product_sku?: string;
    warehouse_id?: number;
    forecast_horizon?: number;
  }) => api.post('/api/v1/forecasting/compare-models', data),

  // Get model metrics
  getModelMetrics: (params: { model_type: string; product_sku?: string }) =>
    api.get('/api/v1/forecasting/metrics', { params }),
};