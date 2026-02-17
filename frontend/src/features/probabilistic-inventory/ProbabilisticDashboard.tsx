import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  getSystemHealth,
  getStatistics,
  clearError,
} from './probabilisticInventorySlice';
import AllocationGenerator from './components/AllocationGenerator';
import MultiForecastChart from './components/MultiForecastChart';
import AllocationVisualizer from './components/AllocationVisualizer';
import ReallocationPanel from './components/ReallocationPanel';

const ProbabilisticInventoryDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { systemHealth, statistics, error } = useAppSelector(
    (state) => state.probabilisticInventory
  );

  const [activeTab, setActiveTab] = useState<'allocate' | 'reallocate' | 'forecast' | 'compare' | 'history'>('allocate');

  useEffect(() => {
    dispatch(getSystemHealth());
    dispatch(getStatistics());
  }, [dispatch]);

  const getHealthStatusColor = (status: string) => {
    if (status === 'healthy') return 'text-green-600';
    if (status === 'degraded') return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📊 Probabilistic Inventory Allocation
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Multi-forecast allocation with game-theoretic optimization and real-time reallocation
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex justify-between items-start">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={() => dispatch(clearError())}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* System Health & Statistics */}
      {(systemHealth || statistics) && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {/* System Status */}
          {systemHealth && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">System Status</div>
              <div className={`text-2xl font-bold ${getHealthStatusColor(systemHealth.status)}`}>
                {systemHealth.status === 'healthy' ? '✅' : '⚠️'} {systemHealth.status}
              </div>
            </div>
          )}

          {/* Total Products */}
          {statistics && (
            <>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Products</div>
                <div className="text-3xl font-bold text-blue-600">
                  {statistics.total_allocations}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Warehouses</div>
                <div className="text-3xl font-bold text-purple-600">
                  {statistics.total_warehouses}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reallocations</div>
                <div className="text-3xl font-bold text-green-600">
                  {statistics.total_reallocations}
                </div>
              </div>
            </>
          )}

          {/* Average Confidence */}
          {systemHealth && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg Confidence</div>
              <div className="text-3xl font-bold text-orange-600">
                {(systemHealth.average_confidence * 100).toFixed(0)}%
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'allocate', label: '⚡ Allocate', icon: '⚡' },
            { id: 'reallocate', label: '🔄 Reallocate', icon: '🔄' },
            { id: 'forecast', label: '📈 Forecasts', icon: '📈' },
            { id: 'compare', label: '📊 Compare', icon: '📊' },
            { id: 'history', label: '📜 History', icon: '📜' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {activeTab === 'allocate' && (
          <div>
            <AllocationGenerator />
            <div className="mt-8">
              <AllocationVisualizer />
            </div>
          </div>
        )}

        {activeTab === 'reallocate' && <ReallocationPanel />}

        {activeTab === 'forecast' && <MultiForecastChart />}


        {activeTab === 'history' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              📜 Reallocation History
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Coming soon: View historical reallocation events
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProbabilisticInventoryDashboard;