import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getStatus, getStatistics, clearError } from './topologyGNNSlice';
import GraphVisualizer from './components/GraphVisualizer';
import DisruptionAnalyzer from './components/DisruptionAnalyzer';
import RouteExplorer from './components/RouteExplorer';
import TopologyInsights from './components/TopologyInsights';

const TopologyGNNDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector(
    (state) => state.topologyGNN
  );

  const [activeTab, setActiveTab] = useState<
    'topology' | 'disruption' | 'routes' | 'insights'
  >('topology');

  // ✅ FIX: entity input state
  const [entityId, setEntityId] = useState('');

  useEffect(() => {
    dispatch(getStatus());
    dispatch(getStatistics());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🕸️ Topology-Aware GNN
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Graph Neural Network for supply chain topology intelligence and disruption prediction
        </p>
      </div>

      {/* 🔍 Entity Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Entity ID
        </label>
        <input
          type="text"
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
          className="w-full md:w-80 px-4 py-2 rounded-lg border border-gray-300
                     dark:border-gray-600 bg-white dark:bg-gray-800
                     text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., SUP001"
        />
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

      {/* System Status */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</div>
            <div
              className={`text-2xl font-bold ${
                status.initialized ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {status.initialized ? '✅ Active' : '⚠️ Inactive'}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Nodes</div>
            <div className="text-3xl font-bold text-blue-600">
              {status.total_nodes}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Edges</div>
            <div className="text-3xl font-bold text-purple-600">
              {status.total_edges}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Events Tracked</div>
            <div className="text-3xl font-bold text-orange-600">
              {status.total_events}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'topology', label: '🕸️ Topology' },
            { id: 'disruption', label: '⚠️ Disruption' },
            { id: 'routes', label: '🛣️ Routes' },
            { id: 'insights', label: '💡 Insights' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {activeTab === 'topology' && <GraphVisualizer />}
        {activeTab === 'disruption' && <DisruptionAnalyzer />}
        {activeTab === 'routes' && <RouteExplorer />}
        {activeTab === 'insights' && <TopologyInsights />}
      </div>
    </div>
  );
};

export default TopologyGNNDashboard;
