import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchDevices,
  fetchStatistics,
  createDevice,
  updateDeviceState,
  clearError,
} from './edgeCloudSlice';
import DeviceCard from './components/DeviceCard';
import CreateDeviceModal from './components/CreateDeviceModal';
import PartitionOptimizer from './components/PartitionOptimizer';
import NetworkAnalyzer from './components/NetworkAnalyzer';
import AdaptiveRepartition from './components/AdaptiveRepartition';
import PartitionComparison from './components/PartitionComparison';

const EdgeCloudDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { devices, statistics, loading, error } = useAppSelector(
    (state) => state.edgeCloud
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'devices' | 'optimize' | 'analyze' | 'adaptive' | 'compare'>('devices');

  useEffect(() => {
    dispatch(fetchDevices());
    dispatch(fetchStatistics());
  }, [dispatch]);

  const handleCreateDevice = async (data: any) => {
    await dispatch(createDevice(data));
    setShowCreateModal(false);
    dispatch(fetchDevices());
  };

  const handleUpdateDevice = async (deviceId: string) => {
    await dispatch(updateDeviceState(deviceId));
    dispatch(fetchDevices());
  };

  const handleSelectDevice = (deviceId: string) => {
    setSelectedDevice(deviceId);
    setActiveTab('optimize');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🔗 Edge-Cloud ML Partitioning
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Optimize neural network deployment across edge devices and cloud infrastructure
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

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Devices</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {statistics.total_devices}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg Battery</div>
            <div className="text-3xl font-bold text-green-600">
              {statistics.average_battery?.toFixed(1)}%
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg Latency</div>
            <div className="text-3xl font-bold text-blue-600">
              {statistics.average_latency?.toFixed(0)}ms
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Device Types</div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              {Object.entries(statistics.devices_by_type || {}).map(([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span>{type}:</span>
                  <span className="font-semibold">{count as number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'devices', label: '📱 Devices', icon: '📱' },
            { id: 'optimize', label: '⚡ Optimize', icon: '⚡' },
            { id: 'analyze', label: '🔍 Analyze', icon: '🔍' },
            { id: 'adaptive', label: '🔄 Adaptive', icon: '🔄' },
            { id: 'compare', label: '📊 Compare', icon: '📊' },
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
        {activeTab === 'devices' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edge Devices
              </h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Create Device
              </button>
            </div>

            {loading && devices.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading devices...</p>
              </div>
            ) : devices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No devices created yet. Create your first edge device!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {devices.map((device) => (
                  <DeviceCard
                    key={device.device_id}
                    device={device}
                    onUpdate={handleUpdateDevice}
                    onSelect={handleSelectDevice}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'optimize' && (
          <PartitionOptimizer selectedDevice={selectedDevice} />
        )}

        {activeTab === 'analyze' && <NetworkAnalyzer />}

        {activeTab === 'adaptive' && (
          <AdaptiveRepartition selectedDevice={selectedDevice} />
        )}

        {activeTab === 'compare' && (
          <PartitionComparison selectedDevice={selectedDevice} />
        )}
      </div>

      {/* Create Device Modal */}
      {showCreateModal && (
        <CreateDeviceModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateDevice}
        />
      )}
    </div>
  );
};

export default EdgeCloudDashboard;