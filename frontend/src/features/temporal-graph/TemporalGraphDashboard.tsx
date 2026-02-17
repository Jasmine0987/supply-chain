import React, { useState, useEffect } from 'react';
import {
  Clock,
  GitBranch,
  Map,
  Activity,
  Database,
  RefreshCw,
  Settings,
  History,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  initializeGraph,
  syncFromDatabase,
  fetchStatistics,
  clearError,
} from './temporalGraphSlice';
import { TimeTravelQuery } from './TimeTravelQuery';
import { CausalChainViewer } from './CausalChainViewer';
import { ShipmentJourneyTimeline } from './ShipmentJourneyTimeline';
import { EventPatternAnalysis } from './EventPatternAnalysis';

type ViewMode = 'time-travel' | 'causal-chain' | 'journey' | 'patterns';

export const TemporalGraphDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { statistics, loading, error, initialized } = useAppSelector(
    (state) => state.temporalGraph
  );

  const [viewMode, setViewMode] = useState<ViewMode>('time-travel');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    dispatch(fetchStatistics());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setTimeout(() => dispatch(clearError()), 5000);
    }
  }, [error, dispatch]);

  const handleInitialize = async () => {
    await dispatch(initializeGraph());
    await dispatch(fetchStatistics());
  };

  const handleSync = async () => {
    await dispatch(syncFromDatabase(100));
    await dispatch(fetchStatistics());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-2 rounded-lg">
              <GitBranch className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Temporal Knowledge Graph
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                🏆 Patentable Feature #1: Time-aware supply chain intelligence
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          {!initialized && (
            <button
              onClick={handleInitialize}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <Database className="h-4 w-4" />
              <span>Initialize Graph</span>
            </button>
          )}

          <button
            onClick={handleSync}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Data</span>
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Nodes</p>
                <p className="text-3xl font-bold">
                  {Object.values(statistics.total_nodes || {})
                    .reduce((sum: number, val: any) => sum + val, 0)
                    .toLocaleString()}
                </p>
              </div>
              <Database className="h-12 w-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Relationships</p>
                <p className="text-3xl font-bold">
                  {(statistics.total_relationships || 0).toLocaleString()}
                </p>
              </div>
              <GitBranch className="h-12 w-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Locations</p>
                <p className="text-3xl font-bold">
                  {(statistics.total_nodes?.Location || 0).toLocaleString()}
                </p>
              </div>
              <Map className="h-12 w-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Events</p>
                <p className="text-3xl font-bold">
                  {(statistics.total_nodes?.Event || 0).toLocaleString()}
                </p>
              </div>
              <Activity className="h-12 w-12 opacity-80" />
            </div>
          </div>
        </div>
      )}

      {/* Feature Highlights */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="bg-purple-600 p-2 rounded-lg">
            <History className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🏆 Patentable Innovation
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              This temporal knowledge graph implements novel features eligible for patent protection:
            </p>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li className="flex items-start">
                <span className="text-purple-600 dark:text-purple-400 mr-2">•</span>
                <span>
                  <strong>Time-travel queries:</strong> Reconstruct historical state at any point in time
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 dark:text-purple-400 mr-2">•</span>
                <span>
                  <strong>Causal inference:</strong> Automated discovery of cause-effect relationships
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 dark:text-purple-400 mr-2">•</span>
                <span>
                  <strong>Temporal indexing:</strong> Bi-temporal versioning with validity periods
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 dark:text-purple-400 mr-2">•</span>
                <span>
                  <strong>Pattern recognition:</strong> Temporal correlation discovery in event streams
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* View Mode Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setViewMode('time-travel')}
          className={`px-4 py-2 font-medium transition-colors ${
            viewMode === 'time-travel'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Time Travel</span>
          </div>
        </button>

        <button
          onClick={() => setViewMode('causal-chain')}
          className={`px-4 py-2 font-medium transition-colors ${
            viewMode === 'causal-chain'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <GitBranch className="h-4 w-4" />
            <span>Causal Chain</span>
          </div>
        </button>

        <button
          onClick={() => setViewMode('journey')}
          className={`px-4 py-2 font-medium transition-colors ${
            viewMode === 'journey'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Map className="h-4 w-4" />
            <span>Shipment Journey</span>
          </div>
        </button>

        <button
          onClick={() => setViewMode('patterns')}
          className={`px-4 py-2 font-medium transition-colors ${
            viewMode === 'patterns'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Event Patterns</span>
          </div>
        </button>
      </div>

      {/* Content */}
      {loading && !statistics ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading temporal graph...</p>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'time-travel' && <TimeTravelQuery />}
          {viewMode === 'causal-chain' && <CausalChainViewer />}
          {viewMode === 'journey' && <ShipmentJourneyTimeline />}
          {viewMode === 'patterns' && <EventPatternAnalysis />}
        </>
      )}
    </div>
  );
};