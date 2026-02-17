import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { optimizePartition } from '../edgeCloudSlice';

interface PartitionOptimizerProps {
  selectedDevice: string | null;
}

const PartitionOptimizer: React.FC<PartitionOptimizerProps> = ({ selectedDevice }) => {
  const dispatch = useAppDispatch();
  const { devices, partitionResult, loading } = useAppSelector((state) => state.edgeCloud);

  const [deviceId, setDeviceId] = useState(selectedDevice || '');
  const [networkType, setNetworkType] = useState<'cnn' | 'lstm' | 'transformer'>('cnn');
  const [objective, setObjective] = useState<'latency' | 'energy' | 'cost' | 'balanced'>('balanced');

  const handleOptimize = async () => {
    if (!deviceId) {
      alert('Please select a device');
      return;
    }

    await dispatch(
      optimizePartition({
        device_id: deviceId,
        network_type: networkType,
        objective,
        constraints: {},
      })
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        ⚡ Optimize Network Partition
      </h2>

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Device Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Edge Device
          </label>
          <select
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select device...</option>
            {devices.map((device) => (
              <option key={device.device_id} value={device.device_id}>
                {device.device_id} ({device.device_type})
              </option>
            ))}
          </select>
        </div>

        {/* Network Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Network Type
          </label>
          <select
            value={networkType}
            onChange={(e) => setNetworkType(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="cnn">🖼️ CNN (Convolutional)</option>
            <option value="lstm">⏱️ LSTM (Recurrent)</option>
            <option value="transformer">🔄 Transformer</option>
          </select>
        </div>

        {/* Optimization Objective */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Optimization Goal
          </label>
          <select
            value={objective}
            onChange={(e) => setObjective(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="balanced">⚖️ Balanced</option>
            <option value="latency">⚡ Minimize Latency</option>
            <option value="energy">🔋 Minimize Energy</option>
            <option value="cost">💰 Minimize Cost</option>
          </select>
        </div>
      </div>

      {/* Optimize Button */}
      <button
        onClick={handleOptimize}
        disabled={loading || !deviceId}
        className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {loading ? '🔄 Optimizing...' : '⚡ Find Optimal Partition'}
      </button>

      {/* Results */}
      {partitionResult && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Optimization Results
          </h3>

          {/* Optimal Partition Point */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Optimal Partition Point
              </div>
              <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                Layer {partitionResult.optimal_partition_point}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Objective: {partitionResult.objective}
              </div>
            </div>
          </div>

          {/* Cost Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Latency</div>
              <div className="text-2xl font-bold text-green-600">
                {partitionResult.cost_details.latency?.toFixed(1) || 0} ms
              </div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Energy Cost</div>
              <div className="text-2xl font-bold text-yellow-600">
                {partitionResult.cost_details.energy_cost?.toFixed(2) || 0} J
              </div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Cloud Cost</div>
              <div className="text-2xl font-bold text-purple-600">
                ${partitionResult.cost_details.cloud_cost?.toFixed(4) || 0}
              </div>
            </div>
          </div>

          {/* Deployment Plan */}
          {partitionResult.deployment_plan && (
            <div className="bg-white dark:bg-gray-700 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                📋 Deployment Plan
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Edge Layers */}
                <div>
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                    📱 Edge Device (Layers 0-{partitionResult.optimal_partition_point})
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Parameters:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {partitionResult.deployment_plan.edge_parameters?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Memory:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {partitionResult.deployment_plan.edge_memory_mb?.toFixed(1) || 0} MB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Computation:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {(partitionResult.deployment_plan.edge_flops / 1e9)?.toFixed(2) || 0} GFLOPS
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cloud Layers */}
                <div>
                  <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
                    ☁️ Cloud (Layers {partitionResult.optimal_partition_point + 1}+)
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Parameters:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {partitionResult.deployment_plan.cloud_parameters?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Memory:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {partitionResult.deployment_plan.cloud_memory_mb?.toFixed(1) || 0} MB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Computation:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {(partitionResult.deployment_plan.cloud_flops / 1e9)?.toFixed(2) || 0} GFLOPS
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {partitionResult.deployment_plan.recommendations && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    💡 Recommendations
                  </div>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    {partitionResult.deployment_plan.recommendations.map((rec: string, idx: number) => (
                      <li key={idx}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PartitionOptimizer;