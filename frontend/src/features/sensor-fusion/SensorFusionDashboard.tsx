// frontend/src/features/sensor-fusion/SensorFusionDashboard.tsx

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  getSystemHealth,
  getStatistics,
  clearError,
} from './sensorFusionSlice';

import ShipmentProcessor from './components/ShipmentProcessor';
import RealtimeAnalyzer from './components/RealtimeAnalyzer';
import CausalGraphView from './components/CausalGraphView';
import DamagePredictionView from './components/DamagePredictionView';

type TabType = 'shipment' | 'realtime' | 'causal' | 'damage';

const SensorFusionDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { systemHealth, error, loading } = useAppSelector(
    (state) => state.sensorFusion
  );

  const [activeTab, setActiveTab] = useState<TabType>('shipment');

  /* ----------------------------------
     Initial system bootstrap
  ---------------------------------- */
  useEffect(() => {
    dispatch(getSystemHealth());
    dispatch(getStatistics());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* ===============================
          Header / Hero
      =============================== */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-blue-600 text-white rounded-xl text-2xl">
            🔬
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Multi-Modal Sensor Fusion
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              AI-powered damage prediction with causal inference
            </p>
          </div>
        </div>
      </div>

      {/* ===============================
          Error Alert
      =============================== */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex justify-between items-start">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={() => dispatch(clearError())}
              className="text-red-600 hover:text-red-800 dark:hover:text-red-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ===============================
          System Health Cards
      =============================== */}
      {systemHealth && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Status
            </p>
            <p
              className={`text-2xl font-bold ${
                systemHealth.initialized
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {systemHealth.initialized ? '✅ Active' : '⚠️ Inactive'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Shipments Processed
            </p>
            <p className="text-3xl font-bold text-blue-600">
              {systemHealth.total_shipments_processed ?? 0}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Causal Edges
            </p>
            <p className="text-3xl font-bold text-purple-600">
              {systemHealth.causal_edges ?? 0}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Sensor Types
            </p>
            <p className="text-3xl font-bold text-orange-600">
              {systemHealth.sensor_types?.length ?? 0}
            </p>
          </div>
        </div>
      )}

      {/* ===============================
          Tabs
      =============================== */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'shipment', label: '📦 Shipment Analysis' },
            { id: 'realtime', label: '⚡ Real-time Analysis' },
            { id: 'causal', label: '🔗 Causal Graph' },
            { id: 'damage', label: '⚠️ Damage Prediction' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
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

      {/* ===============================
          Tab Content
      =============================== */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 min-h-[400px]">
        {loading && (
          <div className="text-center text-gray-500 py-20">
            Loading sensor fusion system...
          </div>
        )}

        {!loading && activeTab === 'shipment' && <ShipmentProcessor />}
        {!loading && activeTab === 'realtime' && <RealtimeAnalyzer />}
        {!loading && activeTab === 'causal' && <CausalGraphView />}
        {!loading && activeTab === 'damage' && <DamagePredictionView />}
      </div>
    </div>
  );
};

export default SensorFusionDashboard;
