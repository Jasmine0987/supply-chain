import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { findAlternativeRoutes } from '../topologyGNNSlice';

const RouteExplorer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { routes, loading } = useAppSelector((state) => state.topologyGNN);
  const [formData, setFormData] = useState({ source: '', destination: '', num_routes: 3 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(findAlternativeRoutes(formData));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold dark:text-white flex items-center">
          <span className="mr-2">🗺️</span> Alternative Route Discovery
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-900/50">
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Origin Node</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            placeholder="e.g. FACTORY_01"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Destination Node</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            placeholder="e.g. WH_NORTH"
            required
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Calculating...' : 'Find Routes'}
          </button>
        </div>
      </form>

      <div className="p-6">
        {routes?.routes ? (
          <div className="space-y-4">
            {routes.routes.map((route: any, idx: number) => (
              <div key={idx} className="p-4 border dark:border-gray-700 rounded-lg hover:border-blue-400 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-blue-600">Option #{idx + 1}</span>
                  <span className="text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 px-2 py-1 rounded">
                    Reliability: {(route.reliability * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center text-sm font-mono text-gray-600 dark:text-gray-400 overflow-x-auto">
                  {route.path.join(' → ')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8 italic">
            Enter origin and destination to explore GNN-optimized paths.
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteExplorer;