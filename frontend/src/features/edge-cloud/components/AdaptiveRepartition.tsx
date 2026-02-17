import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { adaptiveRepartition } from '../edgeCloudSlice';

interface AdaptiveRepartitionProps {
  selectedDevice: string | null;
}

const AdaptiveRepartition: React.FC<AdaptiveRepartitionProps> = ({ selectedDevice }) => {
  const dispatch = useAppDispatch();
  const { devices, adaptiveResult, loading } = useAppSelector((state) => state.edgeCloud);

  const [deviceId, setDeviceId] = useState(selectedDevice || '');
  const [currentPartition, setCurrentPartition] = useState(5);
  const [objective, setObjective] = useState<'latency' | 'energy' | 'cost' | 'balanced'>('balanced');

  const handleRepartition = async () => {
    if (!deviceId) {
      alert('Please select a device');
      return;
    }

    await dispatch(
      adaptiveRepartition({
        device_id: deviceId,
        current_partition: currentPartition,
        objective,
      })
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        🔄 Adaptive Repartitioning
      </h2>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>💡 Adaptive Repartitioning:</strong> Dynamically adjusts the partition point based on changing device conditions (battery, network latency, resource availability).
        </p>
      </div>

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

        {/* Current Partition */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Partition Point
          </label>
          <input
            type="number"
            value={currentPartition}
            onChange={(e) => setCurrentPartition(parseInt(e.target.value))}
            min="0"
            max="20"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Objective */}
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

      {/* Repartition Button */}
      <button
        onClick={handleRepartition}
        disabled={loading || !deviceId}
        className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {loading ? '🔄 Analyzing...' : '🔄 Check for Repartition'}
      </button>

      {/* Results */}
      {adaptiveResult && (
        <div className="mt-8">
          {/* Decision Card */}
          <div
            className={`rounded-lg p-6 mb-6 ${
              adaptiveResult.should_repartition
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
                : 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800'
            }`}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">
                {adaptiveResult.should_repartition ? '✅' : '⏸️'}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {adaptiveResult.should_repartition
                  ? 'Repartitioning Recommended'
                  : 'Current Partition is Optimal'}
              </h3>
              {adaptiveResult.should_repartition && (
                <div className="text-lg text-gray-700 dark:text-gray-300">
                  Move partition from layer <strong>{adaptiveResult.current_partition}</strong> to layer{' '}
                  <strong className="text-green-600 dark:text-green-400">
                    {adaptiveResult.new_partition}
                  </strong>
                </div>
              )}
            </div>
          </div>

          {/* Improvement Metrics */}
          {adaptiveResult.should_repartition && (
            <div className="bg-white dark:bg-gray-700 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                📈 Expected Improvement
              </h4>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-600 dark:text-green-400">
                    {adaptiveResult.improvement_percent.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Performance Improvement
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reasoning */}
          {adaptiveResult.reasoning && (
            <div className="bg-white dark:bg-gray-700 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                🧠 Decision Reasoning
              </h4>

              <div className="space-y-4">
                {/* Current vs New Costs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Current Partition (Layer {adaptiveResult.current_partition})
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Combined Cost:</span>
                        <span className="font-semibold">
                          {adaptiveResult.reasoning.current_cost?.toFixed(4) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                      New Partition (Layer {adaptiveResult.new_partition})
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Combined Cost:</span>
                        <span className="font-semibold text-green-600">
                          {adaptiveResult.reasoning.new_cost?.toFixed(4) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Factors */}
                {adaptiveResult.reasoning.factors && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                      🔍 Contributing Factors
                    </div>
                    <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                      {adaptiveResult.reasoning.factors.map((factor: string, idx: number) => (
                        <li key={idx}>• {factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdaptiveRepartition;