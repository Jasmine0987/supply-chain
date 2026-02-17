import React, { useState } from 'react';
import axios from 'axios';
import { ForecastChart } from './ForecastChart';
import { ModelComparison } from './ModelComparison';

const API_BASE = 'http://localhost:8000/api/v1';

export const ForecastingDashboard: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<'prophet' | 'arima' | 'ensemble'>('ensemble');
  const [forecastData, setForecastData] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [anomaliesData, setAnomaliesData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState(false);
  const [activeTab, setActiveTab] = useState<'forecast' | 'comparison' | 'anomalies'>('forecast');

  const getToken = () => localStorage.getItem('token');

  // Train model
  const handleTrain = async () => {
    setTraining(true);
    try {
      const response = await axios.post(
        `${API_BASE}/forecasting/train`,
        {
          model_type: selectedModel,
          historical_days: 365,
        },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      
      console.log('✅ Training response:', response.data);
      alert(`Model trained successfully! MAPE: ${response.data.metrics.mape.toFixed(2)}%`);
    } catch (error: any) {
      console.error('❌ Training error:', error);
      alert('Training failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setTraining(false);
    }
  };

  // Generate forecast
  const handleForecast = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/forecasting/predict`,
        {
          forecast_type: 'demand',
          model_type: selectedModel,
          forecast_horizon: 30,
        },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      console.log('✅ Forecast response:', response.data);
      setForecastData(response.data);
      setActiveTab('forecast');
    } catch (error: any) {
      console.error('❌ Forecast error:', error);
      alert('Forecast failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Compare models
  const handleCompareModels = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/forecasting/compare-models`,
        {
          forecast_horizon: 30,
        },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      console.log('✅ Comparison response:', response.data);
      setComparisonData(response.data);
      setActiveTab('comparison');
    } catch (error: any) {
      console.error('❌ Comparison error:', error);
      alert('Comparison failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Detect anomalies
  const handleDetectAnomalies = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/forecasting/detect-anomalies`,
        {
          days: 90,
          threshold: 0.95,
        },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      console.log('✅ Anomalies response:', response.data);
      setAnomaliesData(response.data);
      setActiveTab('anomalies');
    } catch (error: any) {
      console.error('❌ Anomalies error:', error);
      alert('Anomaly detection failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Demand Forecasting</h1>
        
        {/* Model Selection */}
        <div className="flex items-center gap-4 mb-4">
          <label className="font-semibold">Model Type:</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as any)}
            className="px-4 py-2 border rounded"
          >
            <option value="prophet">Prophet</option>
            <option value="arima">ARIMA</option>
            <option value="ensemble">Ensemble (Recommended)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleTrain}
            disabled={training}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {training ? 'Training...' : 'Train Model'}
          </button>
          
          <button
            onClick={handleForecast}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition"
          >
            {loading && activeTab === 'forecast' ? 'Loading...' : 'Generate Forecast'}
          </button>
          
          <button
            onClick={handleCompareModels}
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 transition"
          >
            {loading && activeTab === 'comparison' ? 'Loading...' : 'Compare Models'}
          </button>
          
          <button
            onClick={handleDetectAnomalies}
            disabled={loading}
            className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-gray-400 transition"
          >
            {loading && activeTab === 'anomalies' ? 'Loading...' : 'Detect Anomalies'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('forecast')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'forecast'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Forecast
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'comparison'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Model Comparison
          </button>
          <button
            onClick={() => setActiveTab('anomalies')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'anomalies'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Anomalies
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Forecast Tab */}
          {activeTab === 'forecast' && (
            <div>
              {forecastData ? (
                <div className="space-y-6">
                  {/* Chart */}
                  <ForecastChart
                    data={forecastData.predictions || []}
                    title={`${selectedModel.toUpperCase()} Forecast - Next 30 Days`}
                    color="#3b82f6"
                  />
                  
                  {/* Metrics */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Model Performance</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">MAPE</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {(forecastData.metrics?.mape || 0).toFixed(2)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">MAE</p>
                        <p className="text-2xl font-bold text-green-600">
                          {(forecastData.metrics?.mae || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">RMSE</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {(forecastData.metrics?.rmse || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      Model: {selectedModel} | Confidence: {((forecastData.metrics?.confidence_level || 0.95) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">📊 No forecast data yet</p>
                  <p className="text-sm">Click "Generate Forecast" to see predictions</p>
                </div>
              )}
            </div>
          )}

          {/* Comparison Tab */}
          {activeTab === 'comparison' && (
            <div>
              {comparisonData ? (
                <ModelComparison data={comparisonData} />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">🔄 No comparison data yet</p>
                  <p className="text-sm">Click "Compare Models" to see model comparison</p>
                </div>
              )}
            </div>
          )}

          {/* Anomalies Tab */}
          {activeTab === 'anomalies' && (
            <div>
              {anomaliesData ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      🔍 Anomaly Detection Results
                    </h3>
                    <p className="text-blue-800">
                      Found <strong>{anomaliesData.total_count || 0}</strong> anomalies in the last 90 days
                    </p>
                    <div className="flex gap-4 mt-3">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                        Low: {anomaliesData.severity_distribution?.low || 0}
                      </span>
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                        Medium: {anomaliesData.severity_distribution?.medium || 0}
                      </span>
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm">
                        High: {anomaliesData.severity_distribution?.high || 0}
                      </span>
                    </div>
                  </div>

                  {/* Anomaly List */}
                  {anomaliesData.anomalies && anomaliesData.anomalies.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {anomaliesData.anomalies.map((anomaly: any, index: number) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(anomaly.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                {anomaly.actual.toFixed(1)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {anomaly.predicted.toFixed(1)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded ${
                                  anomaly.type === 'high' 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {anomaly.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {anomaly.severity.toFixed(2)}σ
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg">✅ No anomalies detected</p>
                      <p className="text-sm">Your data looks normal!</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">🔍 No anomaly data yet</p>
                  <p className="text-sm">Click "Detect Anomalies" to find unusual patterns</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForecastingDashboard;