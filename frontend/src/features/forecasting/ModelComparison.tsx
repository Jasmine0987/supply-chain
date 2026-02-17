import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ForecastChart } from './ForecastChart';

interface ModelComparisonProps {
  data: {
    prophet: any[];
    arima: any[];
    ensemble: any[];
    metrics: {
      mape: { prophet: number; arima: number; ensemble: number };
      rmse: { prophet: number; arima: number; ensemble: number };
      mae: { prophet: number; arima: number; ensemble: number };
    };
  };
}

export const ModelComparison: React.FC<ModelComparisonProps> = ({ data }) => {
  // Safety check
  if (!data || !data.metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No comparison data available</p>
        <p className="text-gray-400 text-sm mt-2">Click "Compare Models" button to generate</p>
      </div>
    );
  }

  // Transform metrics for bar chart
  const metricsData = [
    {
      name: 'MAPE (%)',
      Prophet: data.metrics.mape?.prophet || 0,
      ARIMA: data.metrics.mape?.arima || 0,
      Ensemble: data.metrics.mape?.ensemble || 0,
    },
    {
      name: 'RMSE',
      Prophet: data.metrics.rmse?.prophet || 0,
      ARIMA: data.metrics.rmse?.arima || 0,
      Ensemble: data.metrics.rmse?.ensemble || 0,
    },
    {
      name: 'MAE',
      Prophet: data.metrics.mae?.prophet || 0,
      ARIMA: data.metrics.mae?.arima || 0,
      Ensemble: data.metrics.mae?.ensemble || 0,
    },
  ];

  // Determine best model
  const getBestModel = () => {
    const mapes = {
      Prophet: data.metrics.mape?.prophet || Infinity,
      ARIMA: data.metrics.mape?.arima || Infinity,
      Ensemble: data.metrics.mape?.ensemble || Infinity,
    };

    const bestModel = Object.entries(mapes).reduce((a, b) => 
      a[1] < b[1] ? a : b
    )[0];

    return { model: bestModel, mape: mapes[bestModel as keyof typeof mapes] };
  };

  const bestModel = getBestModel();

  return (
    <div className="space-y-6">
      {/* Metrics Comparison Chart */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Model Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={metricsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Prophet" fill="#8884d8" />
            <Bar dataKey="ARIMA" fill="#82ca9d" />
            <Bar dataKey="Ensemble" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Metrics Summary */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-blue-50 rounded">
            <h4 className="font-semibold text-blue-600">Prophet</h4>
            <p className="text-sm mt-2">MAPE: {data.metrics.mape?.prophet?.toFixed(2)}%</p>
            <p className="text-sm">RMSE: {data.metrics.rmse?.prophet?.toFixed(2)}</p>
            <p className="text-sm">MAE: {data.metrics.mae?.prophet?.toFixed(2)}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded">
            <h4 className="font-semibold text-green-600">ARIMA</h4>
            <p className="text-sm mt-2">MAPE: {data.metrics.mape?.arima?.toFixed(2)}%</p>
            <p className="text-sm">RMSE: {data.metrics.rmse?.arima?.toFixed(2)}</p>
            <p className="text-sm">MAE: {data.metrics.mae?.arima?.toFixed(2)}</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded">
            <h4 className="font-semibold text-yellow-600">Ensemble</h4>
            <p className="text-sm mt-2">MAPE: {data.metrics.mape?.ensemble?.toFixed(2)}%</p>
            <p className="text-sm">RMSE: {data.metrics.rmse?.ensemble?.toFixed(2)}</p>
            <p className="text-sm">MAE: {data.metrics.mae?.ensemble?.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Individual Model Forecasts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prophet */}
        {data.prophet && data.prophet.length > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <ForecastChart
              data={data.prophet}
              title="Prophet Forecast"
              color="#8884d8"
            />
          </div>
        )}

        {/* ARIMA */}
        {data.arima && data.arima.length > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <ForecastChart
              data={data.arima}
              title="ARIMA Forecast"
              color="#82ca9d"
            />
          </div>
        )}

        {/* Ensemble */}
        {data.ensemble && data.ensemble.length > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <ForecastChart
              data={data.ensemble}
              title="Ensemble Forecast"
              color="#ffc658"
            />
          </div>
        )}
      </div>

      {/* Best Model Recommendation */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h4 className="font-semibold text-green-900 mb-2">🏆 Recommendation</h4>
        <p className="text-sm text-green-800">
          Based on MAPE (Mean Absolute Percentage Error), <strong>{bestModel.model}</strong> performs best 
          with an error rate of <strong>{bestModel.mape.toFixed(2)}%</strong>. 
          Lower MAPE indicates better accuracy. 
          {bestModel.model === 'Ensemble' && " The Ensemble model combines the strengths of both Prophet and ARIMA for balanced predictions."}
          {bestModel.model === 'Prophet' && " Prophet excels at capturing trends and seasonality in your data."}
          {bestModel.model === 'ARIMA' && " ARIMA is particularly good at time-series forecasting with your data pattern."}
        </p>
      </div>
    </div>
  );
};

export default ModelComparison;