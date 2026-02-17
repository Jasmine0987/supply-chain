import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { analyzeNetwork } from '../edgeCloudSlice';

const NetworkAnalyzer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { networkAnalysis, loading } = useAppSelector((state) => state.edgeCloud);

  const [networkType, setNetworkType] = useState<'cnn' | 'lstm' | 'transformer'>('cnn');

  const handleAnalyze = async () => {
    await dispatch(analyzeNetwork(networkType));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        🔍 Neural Network Analysis
      </h2>

      {/* Network Type Selection */}
      <div className="flex items-center space-x-4 mb-6">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Network Architecture:
        </label>
        <select
          value={networkType}
          onChange={(e) => setNetworkType(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="cnn">🖼️ CNN (Convolutional Neural Network)</option>
          <option value="lstm">⏱️ LSTM (Long Short-Term Memory)</option>
          <option value="transformer">🔄 Transformer Architecture</option>
        </select>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
        >
          {loading ? '🔄 Analyzing...' : '🔍 Analyze'}
        </button>
      </div>

      {/* Results */}
      {networkAnalysis && (
        <div>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Layers</div>
              <div className="text-3xl font-bold text-blue-600">
                {networkAnalysis.total_layers}
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Parameters</div>
              <div className="text-3xl font-bold text-green-600">
                {(networkAnalysis.total_parameters / 1e6).toFixed(2)}M
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">FLOPs</div>
              <div className="text-3xl font-bold text-purple-600">
                {(networkAnalysis.total_flops / 1e9).toFixed(2)}G
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Memory</div>
              <div className="text-3xl font-bold text-orange-600">
                {networkAnalysis.total_memory_mb.toFixed(1)} MB
              </div>
            </div>
          </div>

          {/* Partition Candidates */}
          {networkAnalysis.partition_candidates && networkAnalysis.partition_candidates.length > 0 && (
            <div className="bg-white dark:bg-gray-700 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                🎯 Recommended Partition Points
              </h3>
              <div className="flex flex-wrap gap-2">
                {networkAnalysis.partition_candidates.map((layer: number) => (
                  <div
                    key={layer}
                    className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg font-medium"
                  >
                    Layer {layer}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                These layers are good candidates for partitioning based on computational complexity and memory usage.
              </p>
            </div>
          )}

          {/* Layer Details Table */}
          <div className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                📊 Layer-by-Layer Analysis
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Layer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Parameters
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      FLOPs
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Memory (MB)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Output Shape
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {networkAnalysis.layers.map((layer: any, idx: number) => (
                    <tr
                      key={idx}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-600 ${
                        networkAnalysis.partition_candidates.includes(idx)
                          ? 'bg-green-50 dark:bg-green-900/10'
                          : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {idx}
                        {networkAnalysis.partition_candidates.includes(idx) && (
                          <span className="ml-2 text-green-600">🎯</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {layer.layer_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                        {layer.parameters?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                        {layer.flops ? `${(layer.flops / 1e6).toFixed(2)}M` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                        {layer.memory_mb?.toFixed(2) || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400 font-mono text-xs">
                        {layer.output_shape ? JSON.stringify(layer.output_shape) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkAnalyzer;