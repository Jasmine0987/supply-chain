import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { comparePartitions } from '../edgeCloudSlice';

interface PartitionComparisonProps {
  selectedDevice: string | null;
}

const PartitionComparison: React.FC<PartitionComparisonProps> = ({ selectedDevice }) => {
  const dispatch = useAppDispatch();
  const { devices, comparisonResult, loading } = useAppSelector((state) => state.edgeCloud);

  const [deviceId, setDeviceId] = useState(selectedDevice || '');
  const [networkType, setNetworkType] = useState<'cnn' | 'lstm' | 'transformer'>('cnn');
  const [objective, setObjective] = useState<'latency' | 'energy' | 'cost' | 'balanced'>('balanced');
  const [partitionPoints, setPartitionPoints] = useState('2,5,8,10');

  const handleCompare = async () => {
    if (!deviceId) {
      alert('Please select a device');
      return;
    }

    const points = partitionPoints.split(',').map((p) => parseInt(p.trim())).filter((p) => !isNaN(p));
    if (points.length === 0) {
      alert('Please enter valid partition points');
      return;
    }

    await dispatch(
      comparePartitions({
        device_id: deviceId,
        network_type: networkType,
        partition_points: points,
        objective,
      })
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        📊 Compare Partition Strategies
      </h2>

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Network Type
          </label>
          <select
            value={networkType}
            onChange={(e) => setNetworkType(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="cnn">🖼️ CNN</option>
            <option value="lstm">⏱️ LSTM</option>
            <option value="transformer">🔄 Transformer</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Partition Points (comma-separated)
          </label>
          <input
            type="text"
            value={partitionPoints}
            onChange={(e) => setPartitionPoints(e.target.value)}
            placeholder="e.g., 2,5,8,10"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Layer indices to compare
          </p>
        </div>

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

      <button
        onClick={handleCompare}
        disabled={loading || !deviceId}
        className="w-full md:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {loading ? '🔄 Comparing...' : '📊 Compare Partitions'}
      </button>

      {/* Results */}
      {comparisonResult && (
        <div className="mt-8">
          {/* Recommended */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                🏆 Best Partition Point
              </div>
              <div className="text-5xl font-bold text-green-600 dark:text-green-400">
                Layer {comparisonResult.recommended}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Objective: {comparisonResult.objective}
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Detailed Comparison
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Partition Point
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Latency (ms)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Energy (J)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Cloud Cost ($)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Combined Cost
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {comparisonResult.comparisons.map((comparison: any) => (
                    <tr
                      key={comparison.partition_point}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-600 ${
                        comparison.partition_point === comparisonResult.recommended
                          ? 'bg-green-50 dark:bg-green-900/10'
                          : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        Layer {comparison.partition_point}
                        {comparison.partition_point === comparisonResult.recommended && (
                          <span className="ml-2 text-green-600">🏆</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                        {comparison.latency?.toFixed(2) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                        {comparison.energy_cost?.toFixed(3) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                        {comparison.cloud_cost?.toFixed(5) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900 dark:text-white">
                        {comparison.combined_cost?.toFixed(4) || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insights */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-3">
              💡 Insights
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2">
              <li>
                • <strong>Layer {comparisonResult.recommended}</strong> offers the best tradeoff for your {comparisonResult.objective} objective
              </li>
              <li>
                • Earlier partitions reduce latency but increase energy consumption on the edge device
              </li>
              <li>
                • Later partitions save battery but may increase overall latency due to data transfer
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartitionComparison;