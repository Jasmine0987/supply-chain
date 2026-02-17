import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { processShipment } from '../sensorFusionSlice';

const ShipmentProcessor: React.FC = () => {
  const dispatch = useAppDispatch();
  const { shipmentReport, loading } = useAppSelector((state) => state.sensorFusion);

  const [shipmentId, setShipmentId] = useState('SHIP001');
  const [sensorDataText, setSensorDataText] = useState(
    `timestamp,temperature,humidity,shock,vibration
2024-01-01T10:00:00,25.5,60,5.2,3.1
2024-01-01T10:01:00,26.0,61,5.5,3.3
2024-01-01T10:02:00,27.5,62,6.0,3.5
2024-01-01T10:03:00,28.0,63,5.8,3.2`
  );

  const handleProcess = async () => {
    try {
      // Parse CSV data
      const lines = sensorDataText.trim().split('\n');
      const headers = lines[0].split(',');
      
      const sensorData = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const reading: any = {};
        
        headers.forEach((header, index) => {
          const key = header.trim();
          const value = values[index]?.trim();
          
          if (key === 'timestamp') {
            reading[key] = value;
          } else {
            reading[key] = parseFloat(value) || 0;
          }
        });
        
        sensorData.push(reading);
      }

      await dispatch(processShipment({
        shipment_id: shipmentId,
        sensor_data: sensorData
      }));
    } catch (error) {
      console.error('Failed to parse sensor data:', error);
      alert('Invalid CSV format. Please check your data.');
    }
  };

  const getDamageLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-orange-600';
      default: return 'text-green-600';
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        📦 Process Shipment Data
      </h2>

      {/* Input Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Shipment ID
        </label>
        <input
          type="text"
          value={shipmentId}
          onChange={(e) => setShipmentId(e.target.value)}
          placeholder="e.g., SHIP001"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
        />

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Sensor Data (CSV format)
        </label>
        <textarea
          value={sensorDataText}
          onChange={(e) => setSensorDataText(e.target.value)}
          rows={10}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
          placeholder="timestamp,temperature,humidity,shock,vibration"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Format: First row = headers (timestamp,temperature,humidity,shock,vibration), subsequent rows = data
        </p>
      </div>

      <button
        onClick={handleProcess}
        disabled={loading}
        className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {loading ? '🔄 Processing...' : '⚡ Process Shipment'}
      </button>

      {/* Results Section */}
      {shipmentReport && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Analysis Results
          </h3>

          {/* Damage Prediction Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Damage Probability</div>
              <div className={`text-4xl font-bold ${getDamageLevelColor(shipmentReport.damage_prediction?.damage_level)}`}>
                {(shipmentReport.damage_prediction?.final_damage_probability * 100).toFixed(1)}%
              </div>
              <div className="text-sm mt-2 font-medium text-gray-700 dark:text-gray-300">
                Level: {shipmentReport.damage_prediction?.damage_level}
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Anomalies Detected</div>
              <div className="text-4xl font-bold text-yellow-600">
                {shipmentReport.anomalies?.count || 0}
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Causal Edges Found</div>
              <div className="text-4xl font-bold text-purple-600">
                {shipmentReport.causal_analysis?.total_edges || 0}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {shipmentReport.recommendations && shipmentReport.recommendations.length > 0 && (
            <div className="bg-white dark:bg-gray-700 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                💡 Recommendations
              </h4>
              <ul className="space-y-2">
                {shipmentReport.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sensor Statistics */}
          {shipmentReport.sensor_statistics && (
            <div className="bg-white dark:bg-gray-700 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                📊 Sensor Statistics
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sensor</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mean</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Std Dev</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Min</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Max</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Coverage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {Object.entries(shipmentReport.sensor_statistics).map(([sensor, stats]: [string, any]) => (
                      <tr key={sensor} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {sensor}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                          {stats.mean?.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                          {stats.std?.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                          {stats.min?.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                          {stats.max?.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <span className={`font-semibold ${stats.coverage > 0.8 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {(stats.coverage * 100).toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShipmentProcessor;