import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { generateAllocation } from '../probabilisticInventorySlice';

const AllocationGenerator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.probabilisticInventory);

  const [productId, setProductId] = useState('PROD001');
  const [totalInventory, setTotalInventory] = useState(1000);
  const [warehouseIds, setWarehouseIds] = useState('WH001,WH002,WH003');
  const [forecastDays, setForecastDays] = useState(30);
  const [strategy, setStrategy] = useState<'nash_equilibrium' | 'proportional' | 'safety_stock'>('nash_equilibrium');

  const handleGenerate = async () => {
    const warehouseList = warehouseIds.split(',').map(id => id.trim()).filter(id => id.length > 0);
    
    if (warehouseList.length === 0) {
      alert('Please enter at least one warehouse ID');
      return;
    }

    await dispatch(
      generateAllocation({
        product_id: productId,
        total_inventory: totalInventory,
        warehouse_ids: warehouseList,
        forecast_days: forecastDays,
        allocation_strategy: strategy,
      })
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        ⚡ Generate Allocation
      </h2>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>💡 Multi-Forecast Allocation:</strong> Generates optimistic, most likely, and pessimistic demand forecasts,
          then uses game theory to allocate inventory optimally across warehouses.
        </p>
      </div>

      {/* Configuration Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Product ID */}
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

        {/* Total Inventory */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Total Inventory
          </label>
          <input
            type="number"
            value={totalInventory}
            onChange={(e) => setTotalInventory(parseInt(e.target.value))}
            min="1"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Forecast Days */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Forecast Horizon (Days)
          </label>
          <input
            type="number"
            value={forecastDays}
            onChange={(e) => setForecastDays(parseInt(e.target.value))}
            min="1"
            max="90"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Warehouse IDs */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Warehouse IDs (comma-separated)
          </label>
          <input
            type="text"
            value={warehouseIds}
            onChange={(e) => setWarehouseIds(e.target.value)}
            placeholder="e.g., WH001,WH002,WH003"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Strategy */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Allocation Strategy
          </label>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="nash_equilibrium">🎯 Nash Equilibrium (Game Theory)</option>
            <option value="proportional">📊 Proportional (By Demand)</option>
            <option value="safety_stock">🛡️ Safety Stock (Conservative)</option>
          </select>
        </div>
      </div>

      {/* Strategy Descriptions */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Strategy Descriptions:
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>
            <strong>Nash Equilibrium:</strong> Optimal allocation where no warehouse can improve by changing allocation (game theory)
          </li>
          <li>
            <strong>Proportional:</strong> Simple proportional allocation based on expected demand
          </li>
          <li>
            <strong>Safety Stock:</strong> Conservative allocation to cover pessimistic forecast + buffer
          </li>
        </ul>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
      >
        {loading ? '🔄 Generating...' : '⚡ Generate Allocation'}
      </button>
    </div>
  );
};

export default AllocationGenerator;