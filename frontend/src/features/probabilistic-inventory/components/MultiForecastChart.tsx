import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getForecastDetail, getConfidenceBands } from '../probabilisticInventorySlice';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

const MultiForecastChart: React.FC = () => {
  const dispatch = useAppDispatch();
  const { forecastDetail, loading } = useAppSelector(
    (state) => state.probabilisticInventory
  );

  const [productId, setProductId] = useState('PROD001');
  const [warehouseId, setWarehouseId] = useState('WH001');

  const handleFetchForecast = async () => {
    await dispatch(getForecastDetail({ productId, warehouseId }));
    await dispatch(getConfidenceBands({ productId, warehouseId }));
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!forecastDetail || !forecastDetail.forecasts) return [];

    const { optimistic, most_likely, pessimistic } = forecastDetail.forecasts;
    const length = Math.min(optimistic?.length || 0, 30); // Show first 30 days

    const data = [];
    for (let i = 0; i < length; i++) {
      data.push({
        day: i + 1,
        optimistic: optimistic[i],
        most_likely: most_likely[i],
        pessimistic: pessimistic[i],
      });
    }

    return data;
  };

  const chartData = prepareChartData();

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        📈 Multi-Scenario Forecasts
      </h2>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>💡 Three Forecasts:</strong> Optimistic (P90), Most Likely (P50), and Pessimistic (P10).
          The confidence bands decay over time based on forecast age and accuracy.
        </p>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Product ID
          </label>
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="e.g., PROD001"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Warehouse ID
          </label>
          <input
            type="text"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            placeholder="e.g., WH001"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleFetchForecast}
            disabled={loading}
            className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? '🔄 Loading...' : '📈 Load Forecasts'}
          </button>
        </div>
      </div>

      {/* Forecast Metadata */}
      {forecastDetail && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Forecast Age</div>
            <div className="text-2xl font-bold text-blue-600">
              {forecastDetail.forecast_age_days} days
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Confidence</div>
            <div className="text-2xl font-bold text-green-600">
              {(forecastDetail.confidence * 100).toFixed(0)}%
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Mean Demand</div>
            <div className="text-2xl font-bold text-purple-600">
              {forecastDetail.forecasts?.metadata?.mean_demand?.toFixed(0) || 0}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Trend</div>
            <div className={`text-2xl font-bold ${
              (forecastDetail.forecasts?.metadata?.trend || 0) > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {(forecastDetail.forecasts?.metadata?.trend || 0) > 0 ? '📈' : '📉'} 
              {Math.abs(forecastDetail.forecasts?.metadata?.trend || 0).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="bg-white dark:bg-gray-700 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            30-Day Demand Forecast
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="day" 
                stroke="#9CA3AF"
                label={{ value: 'Days', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                stroke="#9CA3AF"
                label={{ value: 'Demand', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend />
              
              {/* Confidence band (area between optimistic and pessimistic) */}
              <Area
                type="monotone"
                dataKey="optimistic"
                stroke="transparent"
                fill="#10B981"
                fillOpacity={0.1}
                name="Confidence Band"
              />
              <Area
                type="monotone"
                dataKey="pessimistic"
                stroke="transparent"
                fill="#10B981"
                fillOpacity={0.1}
              />
              
              {/* Forecast lines */}
              <Line
                type="monotone"
                dataKey="optimistic"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                name="Optimistic (P90)"
              />
              <Line
                type="monotone"
                dataKey="most_likely"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={false}
                name="Most Likely (P50)"
              />
              <Line
                type="monotone"
                dataKey="pessimistic"
                stroke="#EF4444"
                strokeWidth={2}
                dot={false}
                name="Pessimistic (P10)"
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Legend Explanation */}
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Understanding the Forecasts:
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>
                <span className="text-green-600 font-semibold">Optimistic (P90):</span> 90% chance actual demand will be below this
              </li>
              <li>
                <span className="text-blue-600 font-semibold">Most Likely (P50):</span> Expected demand (median)
              </li>
              <li>
                <span className="text-red-600 font-semibold">Pessimistic (P10):</span> 10% chance actual demand will be below this
              </li>
              <li>
                <span className="text-gray-600 font-semibold">Shaded Area:</span> Confidence band showing uncertainty range
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            Load forecasts to view the multi-scenario chart
          </p>
        </div>
      )}
    </div>
  );
};

export default MultiForecastChart;