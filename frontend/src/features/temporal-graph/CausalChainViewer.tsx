import React, { useState } from 'react';
import { GitBranch, Search, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { findCausalChain } from './temporalGraphSlice';

export const CausalChainViewer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { causalChain, loading } = useAppSelector((state) => state.temporalGraph);

  const [eventId, setEventId] = useState('evt_001');
  const [maxDepth, setMaxDepth] = useState(5);

  const handleSearch = () => {
    dispatch(findCausalChain({ eventId, maxDepth }));
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-6">
          <GitBranch className="h-6 w-6 text-purple-600" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Causal Chain Discovery
          </h3>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Discover cause-effect relationships: "What events were caused by this event?"
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Starting Event ID
            </label>
            <input
              type="text"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              placeholder="evt_001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Depth
            </label>
            <input
              type="number"
              value={maxDepth}
              onChange={(e) => setMaxDepth(parseInt(e.target.value))}
              min="1"
              max="10"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          <Search className="h-5 w-5" />
          <span>{loading ? 'Searching...' : 'Find Causal Chain'}</span>
        </button>
      </div>

      {/* Results */}
      {causalChain && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Causal Chains Found
            </h4>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold">
              {causalChain.total_chains} chains
            </span>
          </div>

          {causalChain.chains.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No causal chains found for this event.
            </p>
          ) : (
            <div className="space-y-4">
              {causalChain.chains.map((chain: any, index: number) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs font-semibold">
                        Depth: {chain.depth}
                      </span>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-xs font-semibold">
                        Confidence: {(chain.average_confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {chain.events.map((event: any, eventIndex: number) => (
                      <div key={eventIndex} className="flex items-start space-x-3">
                        {eventIndex > 0 && (
                          <div className="flex flex-col items-center">
                            <div className="w-px h-4 bg-purple-300 dark:bg-purple-700"></div>
                            <ArrowRight className="h-4 w-4 text-purple-500" />
                            <div className="w-px h-4 bg-purple-300 dark:bg-purple-700"></div>
                          </div>
                        )}
                        <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {event.id}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Type: {event.type}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};