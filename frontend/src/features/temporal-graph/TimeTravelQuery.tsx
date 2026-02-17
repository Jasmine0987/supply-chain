import React, { useState } from 'react';
import { Clock, Search, Calendar } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { executeTimeTravelQuery } from './temporalGraphSlice';
import { format } from 'date-fns';

export const TimeTravelQuery: React.FC = () => {
  const dispatch = useAppDispatch();
  const { timeTravelResult, loading } = useAppSelector((state) => state.temporalGraph);

  const [entityType, setEntityType] = useState('Shipment');
  const [entityId, setEntityId] = useState('1');
  const [asOfDate, setAsOfDate] = useState(
    format(new Date(Date.now() - 86400000), "yyyy-MM-dd'T'HH:mm")
  );

  const handleQuery = () => {
    dispatch(
      executeTimeTravelQuery({
        entity_type: entityType,
        entity_id: parseInt(entityId),
        as_of_time: new Date(asOfDate).toISOString(),
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Query Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="h-6 w-6 text-purple-600" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Time-Travel Query
          </h3>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Query historical state: "What did we know about this entity at time T?"
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Entity Type
            </label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="Shipment">Shipment</option>
              <option value="Location">Location</option>
              <option value="Event">Event</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Entity ID
            </label>
            <input
              type="number"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              placeholder="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              As Of Date/Time
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="datetime-local"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleQuery}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          <Search className="h-5 w-5" />
          <span>{loading ? 'Querying...' : 'Execute Time-Travel Query'}</span>
        </button>
      </div>

      {/* Results */}
      {timeTravelResult && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Historical State
          </h4>

          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Entity Type</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {timeTravelResult.entity_type}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Entity ID</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {timeTravelResult.entity_id}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">As Of Time</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {format(new Date(timeTravelResult.as_of_time), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Valid Period</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {format(new Date(timeTravelResult.valid_from), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">State Data</h5>
              <pre className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-auto text-sm">
                {JSON.stringify(timeTravelResult.state, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};