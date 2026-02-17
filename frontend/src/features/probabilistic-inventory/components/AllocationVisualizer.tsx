import React from 'react';
import { useAppSelector } from '../../../store/hooks';

const AllocationVisualizer: React.FC = () => {
  const { allocation } = useAppSelector((state) => state.probabilisticInventory);

  if (!allocation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No allocation results yet. Generate an allocation to see results.
        </p>
      </div>
    );
  }

  const allocations = allocation.allocations || {};
  const expectedDemands = allocation.expected_demands || {};
  const confidenceMetrics = allocation.confidence_metrics || {};
  const totalInventory = allocation.total_inventory || 0;

  // Calculate totals
  const totalExpectedDemand = Object.values(expectedDemands).reduce((sum: number, val: any) => sum + val, 0);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Allocation Results
      </h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Inventory</div>
          <div className="text-3xl font-bold text-blue-600">{totalInventory}</div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Expected Demand (7d)</div>
          <div className="text-3xl font-bold text-green-600">{totalExpectedDemand.toFixed(0)}</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fairness Score</div>
          <div className="text-3xl font-bold text-purple-600">
            {((1 - allocation.fairness_score) * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Higher is more fair
          </div>
        </div>
      </div>

      {/* Allocation Table */}
      <div className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h4 className="font-semibold text-gray-900 dark:text-white">Warehouse Allocations</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Warehouse
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Allocation
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Expected Demand (7d)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Service Level
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Confidence
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {Object.entries(allocations).map(([warehouseId, allocation]: [string, any]) => {
                const expectedDemand = expectedDemands[warehouseId] || 0;
                const confidence = confidenceMetrics[warehouseId] || 1;
                const serviceLevel = expectedDemand > 0 ? (allocation / expectedDemand) * 100 : 100;
                const daysOfStock = expectedDemand > 0 ? (allocation / (expectedDemand / 7)) : 999;

                return (
                  <tr key={warehouseId} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {warehouseId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className="font-semibold text-blue-600">{allocation}</span> units
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                      {expectedDemand.toFixed(0)} units
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span
                        className={`font-semibold ${
                          serviceLevel >= 100
                            ? 'text-green-600'
                            : serviceLevel >= 80
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {serviceLevel.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span
                        className={`font-semibold ${
                          confidence >= 0.7
                            ? 'text-green-600'
                            : confidence >= 0.4
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {(confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {daysOfStock < 3 ? (
                        <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 dark:bg-red-900/30 dark:text-red-300 rounded">
                          ⚠️ Low Stock
                        </span>
                      ) : daysOfStock > 15 ? (
                        <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                          📦 Overstock
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 dark:bg-green-900/30 dark:text-green-300 rounded">
                          ✅ Optimal
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Strategy:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {allocation.allocation_strategy}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Warehouses:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {allocation.metadata?.num_warehouses || 0}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Forecast Days:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {allocation.metadata?.forecast_days || 0}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Generated:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {new Date(allocation.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationVisualizer;