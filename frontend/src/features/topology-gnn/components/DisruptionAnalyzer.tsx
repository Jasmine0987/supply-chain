import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { predictDisruption } from '../topologyGNNSlice';

const DisruptionAnalyzer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { disruption, loading } = useAppSelector((state) => state.topologyGNN);
  const [entityInput, setEntityInput] = useState('');

  const handlePredict = () => {
    const entities = entityInput.split(',').map(e => e.trim()).filter(e => e);
    if (entities.length > 0) {
      dispatch(predictDisruption({ disrupted_entities: entities }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
          <span className="mr-2">⚡</span> Disruption Impact Predictor
        </h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Target Entities (ID-001, ID-002...)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={entityInput}
              onChange={(e) => setEntityInput(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter entity IDs separated by commas"
            />
            <button
              onClick={handlePredict}
              disabled={loading}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Simulate Failure'}
            </button>
          </div>
        </div>
      </div>

      {disruption && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-100 dark:border-red-800">
            <h3 className="text-red-800 dark:text-red-300 font-bold mb-2">Network Risk Score</h3>
            <div className="text-4xl font-black text-red-600">
              {(disruption.risk_score * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-red-700 dark:text-red-400 mt-2">
              Cascading failure probability across the supply chain.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold mb-3 dark:text-white">Impacted Downstream Nodes</h3>
            <div className="flex flex-wrap gap-2">
              {disruption.affected_nodes?.map((node: string) => (
                <span key={node} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-mono dark:text-gray-300">
                  {node}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisruptionAnalyzer;