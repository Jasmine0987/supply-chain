import React, { useState, useEffect } from 'react';
import { AlertTriangle, Activity, Settings, RefreshCw, Download } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  detectAnomalies,
  trainAnomalyModel,
  fetchAnomalyStatistics,
  clearError,
} from './anomalySlice';
import { AnomalyDetection } from '../forecasting/AnomalyDetection';

// Define the detection method types
type DetectionMethod = 'isolation_forest' | 'z_score' | 'iqr' | 'mad' | 'ensemble';

export const AnomalyDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentDetection, statistics, loading, error, trainingStatus } = useAppSelector(
    (state) => state.anomaly
  );

  const [method, setMethod] = useState<DetectionMethod>('isolation_forest');
  const [days, setDays] = useState(365);
  const [threshold, setThreshold] = useState(3.0);
  const [contamination] = useState(0.1);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    dispatch(fetchAnomalyStatistics(30));
    handleDetect();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleDetect = () => {
    dispatch(
      detectAnomalies({
        method,
        days,
        threshold,
        contamination,
      })
    );
  };

  const handleTrain = () => {
    dispatch(
      trainAnomalyModel({
        data_source: 'demand',
        method,
        contamination,
        historical_days: 180,
      })
    );
  };

  const handleExport = () => {
    if (!currentDetection) return;

    const csvContent = [
      ['Date', 'Value', 'Severity', 'Method'],
      ...currentDetection.anomalies.map((a) => [
        a.date,
        a.value.toFixed(2),
        a.severity,
        currentDetection.method,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anomalies_${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  /**
   * FIX: Map API anomalies to the structure expected by AnomalyDetection component
   * This ensures 'actual', 'predicted', 'lower_bound', and 'upper_bound' exist.
   */
  const formattedAnomalies = currentDetection?.anomalies.map(a => ({
    ...a,
    actual: a.actual ?? a.value,
    predicted: a.predicted ?? a.value,
    lower_bound: a.lower_bound ?? (a.value * 0.9),
    upper_bound: a.upper_bound ?? (a.value * 1.1),
  })) || [];

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Anomaly Detection
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            AI-powered detection of unusual patterns in supply chain data
          </p>
        </div>

        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>

          <button
            onClick={handleDetect}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Detect</span>
          </button>

          {currentDetection && (
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Data Points</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statistics.total_data_points}
                </p>
              </div>
              <Activity className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Anomalies</p>
                <p className="text-2xl font-bold text-orange-600">
                  {statistics.anomalies_detected}
                </p>
              </div>
              <AlertTriangle className="h-10 w-10 text-orange-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Anomaly Rate</p>
                <p className="text-2xl font-bold text-red-600">
                  {statistics.anomaly_rate.toFixed(1)}%
                </p>
              </div>
              <div className="text-red-500 text-3xl">⚠️</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
                <p className="text-2xl font-bold text-red-700">
                  {statistics.severity_distribution?.critical || 0}
                </p>
              </div>
              <div className="text-red-700 text-3xl">🚨</div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Detection Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Detection Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as DetectionMethod)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="isolation_forest">Isolation Forest (ML)</option>
                <option value="z_score">Z-Score (Statistical)</option>
                <option value="iqr">IQR (Interquartile Range)</option>
                <option value="mad">MAD (Median Absolute Deviation)</option>
                <option value="ensemble">Ensemble (Multiple Methods)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Historical Days
              </label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                min="30"
                max="365"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Threshold
              </label>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                min="1"
                max="5"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleTrain}
                disabled={trainingStatus === 'training'}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {trainingStatus === 'training' ? 'Training...' : 'Train Model'}
              </button>
            </div>
          </div>

          {trainingStatus === 'success' && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✓ Model trained successfully!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {loading && !currentDetection ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Detecting anomalies...</p>
          </div>
        </div>
      ) : currentDetection ? (
        <AnomalyDetection
          anomalies={formattedAnomalies}
          severityDistribution={currentDetection.severity_distribution}
        />
      ) : null}
    </div>
  );
};