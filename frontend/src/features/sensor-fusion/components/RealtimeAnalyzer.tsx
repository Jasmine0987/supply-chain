import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { analyzeRealtime } from '../sensorFusionSlice';

const RealtimeAnalyzer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { realtimeAnalysis, loading } = useAppSelector((state) => state.sensorFusion);

  const [sensorValues, setSensorValues] = useState({
    temperature: 25.0,
    humidity: 60.0,
    shock: 5.0,
    vibration: 3.0,
  });

  const handleInputChange = (sensor: string, value: string) => {
    setSensorValues({
      ...sensorValues,
      [sensor]: parseFloat(value) || 0
    });
  };

  const handleAnalyze = async () => {
    await dispatch(analyzeRealtime({
      sensor_readings: sensorValues
    }));
  };

  const getDamageLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-orange-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        ⚡ Real-time Sensor Analysis
      </h2>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>💡 Real-time Analysis:</strong> Input current sensor readings to get instant damage prediction
          and inferred values for missing sensors using the fusion model.
        </p>
      </div>

      {/* Sensor Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Object.entries(sensorValues).map(([sensor, value]) => (
          <div key={sensor} className="bg-white dark:bg-gray-700 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
              {sensor}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleInputChange(sensor, e.target.value)}
              step="0.1"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {sensor === 'temperature' && 'Temperature (°C)'}
              {sensor === 'humidity' && 'Humidity (%)'}
              {sensor === 'shock' && 'Shock (g-force)'}
              {sensor === 'vibration' && 'Vibration (g-force)'}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {loading ? '🔄 Analyzing...' : '⚡ Analyze Now'}
      </button>

      {/* Results */}
      {realtimeAnalysis && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Analysis Results
          </h3>

          {/* Damage Prediction */}
          {realtimeAnalysis.damage_prediction && (
            <div className="mb-6">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Damage Probability</div>
                    <div className="text-4xl font-bold text-red-600">
                      {(realtimeAnalysis.damage_prediction.damage_probability * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Level</div>
                    <div className={`inline-block px-4 py-2 rounded-lg text-white font-semibold ${getDamageLevelColor(realtimeAnalysis.damage_prediction.damage_level)}`}>
                      {realtimeAnalysis.damage_prediction.damage_level}
                    </div>
                  </div>
                </div>

                {/* Damage Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
                  <div
                    className={`h-4 rounded-full ${getDamageLevelColor(realtimeAnalysis.damage_prediction.damage_level)}`}
                    style={{ width: `${realtimeAnalysis.damage_prediction.damage_probability * 100}%` }}
                  />
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Uncertainty: {(realtimeAnalysis.damage_prediction.uncertainty * 100).toFixed(1)}%
                </div>
              </div>

              {/* Primary Contributors */}
              {realtimeAnalysis.damage_prediction.primary_contributors && (
                <div className="mt-4 bg-white dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Primary Damage Contributors
                  </h4>
                  <div className="space-y-2">
                    {realtimeAnalysis.damage_prediction.primary_contributors.map((contrib: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {contrib.sensor}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${contrib.contribution * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white w-12 text-right">
                            {(contrib.contribution * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Inferred Sensors */}
          {realtimeAnalysis.inferred_sensors && Object.keys(realtimeAnalysis.inferred_sensors).length > 0 && (
            <div className="bg-white dark:bg-gray-700 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                🔮 Inferred Sensor Values
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(realtimeAnalysis.inferred_sensors).map(([sensor, data]: [string, any]) => (
                  <div key={sensor} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 capitalize">
                      {sensor}
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {data.value?.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Uncertainty: ±{data.uncertainty?.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                These values were inferred using the probabilistic graphical model based on observed sensors
              </p>
            </div>
          )}

          {/* Anomaly Detection */}
          {realtimeAnalysis.anomaly && (
            <div className={`rounded-lg p-4 ${realtimeAnalysis.anomaly.is_anomaly ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Anomaly Detection
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {realtimeAnalysis.anomaly.is_anomaly
                      ? '⚠️ Anomalous readings detected!'
                      : '✅ Readings are within normal range'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {realtimeAnalysis.anomaly.score?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Anomaly Score
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RealtimeAnalyzer;