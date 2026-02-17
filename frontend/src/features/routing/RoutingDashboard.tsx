import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { optimizeRoute, optimizeWithConstraints } from '../../features/routing/routingSlice';
import { RouteMap } from './RouteMap';
import { MapPin, TrendingUp, DollarSign, Truck, Clock, AlertCircle } from 'lucide-react';

export const RoutingDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { optimizedRoute, loading, error } = useAppSelector((state) => state.routing);

  // Enhanced state
  const [method, setMethod] = useState<'genetic' | 'dijkstra'>('genetic');
  const [vehicleCapacity, setVehicleCapacity] = useState(200);
  const [showComparison, setShowComparison] = useState(false);

  // Sample locations with realistic data
  const [locations] = useState([
    { 
      name: 'Main Warehouse', 
      coordinates: [40.7128, -74.0060] as [number, number],
      volume: 0,
      address: '123 Industrial Blvd, NYC'
    },
    { 
      name: 'Stop A - Manhattan', 
      coordinates: [40.7580, -73.9855] as [number, number],
      volume: 45,
      address: '456 5th Ave, Manhattan'
    },
    { 
      name: 'Stop B - Brooklyn', 
      coordinates: [40.6782, -73.9442] as [number, number],
      volume: 35,
      address: '789 Atlantic Ave, Brooklyn'
    },
    { 
      name: 'Stop C - Queens', 
      coordinates: [40.7282, -73.7949] as [number, number],
      volume: 40,
      address: '321 Queens Blvd, Queens'
    },
  ]);

  const totalVolume = locations.slice(1).reduce((sum, loc) => sum + (loc.volume || 0), 0);
  const vehiclesNeeded = Math.ceil(totalVolume / vehicleCapacity);

  const handleOptimize = () => {
    dispatch(
      optimizeRoute({
        start_location: locations[0].name,
        end_location: locations[0].name,
        waypoints: locations.slice(1, -1).map((l) => l.name),
        locations: locations,
        method: method,
      })
    );
  };

  const handleOptimizeWithConstraints = () => {
    dispatch(
      optimizeWithConstraints({
        locations: locations,
        constraints: {
          vehicle_capacity: vehicleCapacity,
          include_carbon: true,
          road_type: 'default',
        },
      })
    );
  };

  const handleCompareAlgorithms = async () => {
    setShowComparison(true);
    // Run both algorithms
    await Promise.all([
      dispatch(optimizeRoute({
        start_location: locations[0].name,
        end_location: locations[0].name,
        waypoints: locations.slice(1, -1).map((l) => l.name),
        locations: locations,
        method: 'genetic',
      })),
      dispatch(optimizeRoute({
        start_location: locations[0].name,
        end_location: locations[0].name,
        waypoints: locations.slice(1, -1).map((l) => l.name),
        locations: locations,
        method: 'dijkstra',
      })),
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🚚 Route Optimization</h1>
        <p className="text-blue-100">AI-powered routing for efficient deliveries</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Stops</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {locations.length - 1}
              </p>
            </div>
            <MapPin className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalVolume} units
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Vehicles Needed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {vehiclesNeeded}
              </p>
            </div>
            <Truck className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Capacity</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {vehicleCapacity}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Optimization Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Algorithm Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Algorithm
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as 'genetic' | 'dijkstra')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="genetic">🧬 Genetic Algorithm (Best for TSP)</option>
              <option value="dijkstra">🎯 Dijkstra (Shortest Path)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {method === 'genetic' 
                ? 'Finds optimal route order through all stops'
                : 'Finds shortest path between consecutive stops'}
            </p>
          </div>

          {/* Vehicle Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vehicle Capacity (units)
            </label>
            <input
              type="number"
              value={vehicleCapacity}
              onChange={(e) => setVehicleCapacity(Number(e.target.value))}
              min="50"
              max="500"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Current load: {totalVolume} / {vehicleCapacity} units ({Math.round((totalVolume / vehicleCapacity) * 100)}%)
            </p>
          </div>

          {/* Capacity Status */}
          <div className="flex items-center">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Capacity Status
              </label>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                      totalVolume <= vehicleCapacity 
                        ? 'text-green-600 bg-green-200' 
                        : 'text-red-600 bg-red-200'
                    }`}>
                      {totalVolume <= vehicleCapacity ? '✓ Within Capacity' : '⚠ Over Capacity'}
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                  <div
                    style={{ width: `${Math.min((totalVolume / vehicleCapacity) * 100, 100)}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                      totalVolume <= vehicleCapacity ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-4">
          <button
            onClick={handleOptimize}
            disabled={loading}
            className="flex-1 min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                <span>Optimizing...</span>
              </>
            ) : (
              <>
                <MapPin className="h-5 w-5" />
                <span>Optimize Route</span>
              </>
            )}
          </button>

          <button
            onClick={handleOptimizeWithConstraints}
            disabled={loading}
            className="flex-1 min-w-[200px] bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                <span>Optimizing...</span>
              </>
            ) : (
              <>
                <Truck className="h-5 w-5" />
                <span>With Constraints</span>
              </>
            )}
          </button>

          <button
            onClick={handleCompareAlgorithms}
            disabled={loading}
            className="flex-1 min-w-[200px] bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <TrendingUp className="h-5 w-5" />
            <span>Compare Algorithms</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-red-800 dark:text-red-200 font-medium">Optimization Error</p>
          </div>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Results Section */}
      {optimizedRoute && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map - Takes 2/3 width */}
          <div className="lg:col-span-2">
            <RouteMap
              locations={locations}
              route={optimizedRoute.route || optimizedRoute.optimized_routes?.[0]?.locations}
            />
          </div>

          {/* Stats Panel - Takes 1/3 width */}
          <div className="space-y-4">
            {/* Route Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                <span>Route Summary</span>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Method</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {optimizedRoute.method === 'genetic_algorithm' ? '🧬 Genetic' : '🎯 Dijkstra'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Distance</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {optimizedRoute.total_distance?.toFixed(2) || 
                     optimizedRoute.optimized_routes?.[0]?.distance_km?.toFixed(2)} km
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Stops</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {(optimizedRoute.route?.length || optimizedRoute.optimized_routes?.[0]?.locations?.length || 0) - 1}
                  </span>
                </div>
              </div>
            </div>

            {/* Cost Analysis */}
            {optimizedRoute.cost_analysis && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <span>Cost Analysis</span>
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      ${optimizedRoute.cost_analysis.total_cost}
                    </span>
                  </div>
                  {Object.entries(optimizedRoute.cost_analysis.breakdown || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        ${typeof value === 'number' 
                           ? value.toFixed(2) 
                           : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Time Estimate */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-500" />
                <span>Time Estimate</span>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Driving Time</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {optimizedRoute.cost_analysis?.metrics?.duration_hours?.toFixed(1) || 
                     optimizedRoute.optimized_routes?.[0]?.estimated_duration_hours?.toFixed(1)} hrs
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cost per km</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    ${optimizedRoute.cost_analysis?.metrics?.cost_per_km?.toFixed(2) || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Multi-Vehicle Info */}
            {optimizedRoute.total_vehicles_needed && optimizedRoute.total_vehicles_needed > 1 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Truck className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <h3 className="font-bold text-yellow-800 dark:text-yellow-200">
                    Multiple Vehicles Required
                  </h3>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Capacity exceeded. Using {optimizedRoute.total_vehicles_needed} vehicles for this delivery.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Locations List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Delivery Stops</h3>
        <div className="space-y-2">
          {locations.map((location, index) => (
            <div
              key={location.name}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-green-500' : 'bg-blue-500'
                }`}>
                  {index === 0 ? '🏭' : String.fromCharCode(64 + index)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{location.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{location.address}</p>
                </div>
              </div>
              {location.volume > 0 && (
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {location.volume} units
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};