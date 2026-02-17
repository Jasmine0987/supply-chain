import React, { useState } from 'react';
import { Activity, Search, TrendingUp } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { analyzeEventPatterns, findEventCorrelations } from './temporalGraphSlice';
import { format } from 'date-fns';

export const EventPatternAnalysis: React.FC = () => {
  const dispatch = useAppDispatch();
  const { eventPatterns, eventCorrelations, loading } = useAppSelector(
    (state) => state.temporalGraph
  );

  const [analysisType, setAnalysisType] = useState<'patterns' | 'correlations'>('patterns');
  const [eventType, setEventType] = useState('shipment_created');
  const [days, setDays] = useState(30);
  const [eventType1, setEventType1] = useState('shipment_created');
  const [eventType2, setEventType2] = useState('in_transit');

  const handleAnalyzePatterns = () => {
    dispatch(analyzeEventPatterns({ eventType, days }));
  };

  const handleFindCorrelations = () => {
    dispatch(
      findEventCorrelations({
        event_type_1: eventType1,
        event_type_2: eventType2,
        max_time_diff_hours: 24,
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Tab Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 flex space-x-2">
        <button
          onClick={() => setAnalysisType('patterns')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            analysisType === 'patterns'
              ? 'bg-purple-600 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Event Patterns
        </button>
        <button
          onClick={() => setAnalysisType('correlations')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            analysisType === 'correlations'
              ? 'bg-purple-600 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Event Correlations
        </button>
      </div>

      {/* Pattern Analysis */}
      {analysisType === 'patterns' && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Activity className="h-6 w-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Event Pattern Analysis
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Type
                </label>
                <input
                  type="text"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="shipment_created"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Window (Days)
                </label>
                <input
                  type="number"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              onClick={handleAnalyzePatterns}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <Search className="h-5 w-5" />
              <span>{loading ? 'Analyzing...' : 'Analyze Patterns'}</span>
            </button>
          </div>

          {eventPatterns && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Pattern Results
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Count</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {eventPatterns.total_count}
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Frequency/Day</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {eventPatterns.frequency_per_day.toFixed(2)}
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">First Occurrence</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {eventPatterns.first_occurrence
                      ? format(new Date(eventPatterns.first_occurrence), 'MMM dd')
                      : 'N/A'}
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Occurrence</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {eventPatterns.last_occurrence
                      ? format(new Date(eventPatterns.last_occurrence), 'MMM dd')
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Correlation Analysis */}
      {analysisType === 'correlations' && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Event Correlation Discovery
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Type 1
                </label>
                <input
                  type="text"
                  value={eventType1}
                  onChange={(e) => setEventType1(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="shipment_created"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Type 2
                </label>
                <input
                  type="text"
                  value={eventType2}
                  onChange={(e) => setEventType2(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="in_transit"
                />
              </div>
            </div>

            <button
              onClick={handleFindCorrelations}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <Search className="h-5 w-5" />
              <span>{loading ? 'Searching...' : 'Find Correlations'}</span>
            </button>
          </div>

          {eventCorrelations && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Correlation Results
              </h4>

              {eventCorrelations.correlation_found ? (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-green-800 dark:text-green-200 font-semibold mb-2">
                      ✓ Correlation Found
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {eventCorrelations.correlation_count} instances where{' '}
                      <strong>{eventCorrelations.event_type_1}</strong> was followed by{' '}
                      <strong>{eventCorrelations.event_type_2}</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg Time Diff</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {eventCorrelations.avg_time_diff_hours.toFixed(1)}h
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Min Time Diff</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {eventCorrelations.min_time_diff_hours.toFixed(1)}h
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Max Time Diff</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {eventCorrelations.max_time_diff_hours.toFixed(1)}h
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
                  <p className="text-yellow-800 dark:text-yellow-200">
                    No correlation found between these event types
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};