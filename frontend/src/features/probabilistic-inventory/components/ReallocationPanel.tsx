// ReallocationPanel.tsx
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { checkReallocation } from '../probabilisticInventorySlice';

const ReallocationPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { reallocation, loading } = useAppSelector((state) => state.probabilisticInventory);

  const [productId, setProductId] = useState('PROD001');
  const [actualDemands, setActualDemands] = useState('WH001:50,55,52\nWH002:40,38,42\nWH003:60,65,58');

  const handleCheckReallocation = async () => {
    // Parse actual demands
    const lines = actualDemands.split('\n');
    const demandsObj: Record<string, number[]> = {};

    lines.forEach(line => {
      const [wh, values] = line.split(':');
      if (wh && values) {
        demandsObj[wh.trim()] = values.split(',').map(v => parseFloat(v.trim()));
      }
    });

    await dispatch(checkReallocation({
      product_id: productId,
      actual_demands: demandsObj
    }));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        🔄 Real-time Reallocation
      </h2>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          <strong>💡 Adaptive Reallocation:</strong> Compares actual demand trends with forecasts 
          and triggers reallocation when confidence decays or demand significantly deviates.
        </p>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
            Actual Demands (last 3 days)
          </label>
          <textarea
            value={actualDemands}
            onChange={(e) => setActualDemands(e.target.value)}
            rows={3}
            placeholder="WH001:50,55,52&#10;WH002:40,38,42"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Format: WarehouseID:value1,value2,value3 (one per line)
          </p>
        </div>
      </div>

      <button
        onClick={handleCheckReallocation}
        disabled={loading}
        className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
      >
        {loading ? '🔄 Checking...' : '🔄 Check Reallocation Need'}
      </button>

      {/* Results */}
      {reallocation && (
        <div className="mt-8">
          {/* Recommendations */}
          {reallocation.recommendations && reallocation.recommendations.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                📋 Recommendations
              </h3>
              <div className="space-y-3">
                {reallocation.recommendations.map((rec: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 ${
                      rec.priority === 'critical'
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800'
                        : rec.priority === 'high'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {rec.warehouse_id}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {rec.reason}
                        </p>
                        <div className="mt-2 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Days of stock: </span>
                          <span className="font-semibold">{rec.days_of_stock.toFixed(1)} days</span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded ${
                          rec.priority === 'critical'
                            ? 'bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-300'
                            : rec.priority === 'high'
                            ? 'bg-yellow-200 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300'
                            : 'bg-blue-200 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300'
                        }`}
                      >
                        {rec.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transfer Plan */}
          {reallocation.transfer_plan && Object.keys(reallocation.transfer_plan).length > 0 && (
            <div className="bg-white dark:bg-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                🚚 Transfer Plan
              </h3>
              <div className="space-y-3">
                {Object.entries(reallocation.transfer_plan).map(([from, destinations]: [string, any]) => (
                  Object.entries(destinations).map(([to, amount]: [string, any]) => (
                    <div key={`${from}-${to}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className="font-medium text-gray-900 dark:text-white">{from}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium text-gray-900 dark:text-white">{to}</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">{amount} units</span>
                    </div>
                  ))
                ))}
              </div>
            </div>
          )}

          {/* No Reallocation Needed */}
          {reallocation.recommendations && reallocation.recommendations.length === 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 text-center">
              <div className="text-4xl mb-2">✅</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                No Reallocation Needed
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Current allocations are optimal for the given demand patterns.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReallocationPanel;


// StrategyComparison.tsx - Export separately
export const StrategyComparison: React.FC = () => {
  const dispatch = useAppDispatch();
  const { strategyComparison, loading } = useAppSelector((state: any) => state.probabilisticInventory);

  const [productId, setProductId] = useState('PROD001');
  const [totalInventory, setTotalInventory] = useState(1000);
  const [warehouseIds, setWarehouseIds] = useState('WH001,WH002,WH003');

  const handleCompare = async () => {
    const warehouseList = warehouseIds.split(',').map(id => id.trim());
    
    await dispatch(require('../probabilisticInventorySlice').compareStrategies({
      product_id: productId,
      total_inventory: totalInventory,
      warehouse_ids: warehouseList,
      strategies: ['nash_equilibrium', 'proportional', 'safety_stock']
    }));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        📊 Strategy Comparison
      </h2>

      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
        <p className="text-sm text-purple-800 dark:text-purple-300">
          <strong>💡 Compare Strategies:</strong> See how different allocation strategies perform 
          in terms of fairness and service levels.
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
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Total Inventory
          </label>
          <input
            type="number"
            value={totalInventory}
            onChange={(e) => setTotalInventory(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Warehouse IDs
          </label>
          <input
            type="text"
            value={warehouseIds}
            onChange={(e) => setWarehouseIds(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <button
        onClick={handleCompare}
        disabled={loading}
        className="w-full md:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium"
      >
        {loading ? '🔄 Comparing...' : '📊 Compare Strategies'}
      </button>

      {/* Results */}
      {strategyComparison && strategyComparison.comparisons && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(strategyComparison.comparisons).map(([strategy, data]: [string, any]) => (
            <div key={strategy} className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-center">
                {strategy === 'nash_equilibrium' ? '🎯 Nash Equilibrium' :
                 strategy === 'proportional' ? '📊 Proportional' :
                 '🛡️ Safety Stock'}
              </h3>

              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Avg Service Level
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    {data.avg_service_level?.toFixed(0)}%
                  </div>
                </div>

                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Fairness Score
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    {((1 - data.fairness_score) * 100).toFixed(0)}%
                  </div>
                </div>

                <div className="text-sm">
                  <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Service Levels:
                  </div>
                  {Object.entries(data.service_levels || {}).map(([wh, level]: [string, any]) => (
                    <div key={wh} className="flex justify-between py-1">
                      <span className="text-gray-600 dark:text-gray-400">{wh}:</span>
                      <span className="font-semibold">{level.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};