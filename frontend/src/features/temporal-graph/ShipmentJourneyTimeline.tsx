import React, { useState } from 'react';
import { Map, Search, MapPin, Package } from 'lucide-react';
import { format } from 'date-fns';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getShipmentJourney } from './temporalGraphSlice';

export const ShipmentJourneyTimeline: React.FC = () => {
  const dispatch = useAppDispatch();

  const { shipmentJourney, loading } = useAppSelector(
    (state) => state.temporalGraph
  );

  const [shipmentId, setShipmentId] = useState('1');

  const handleSearch = () => {
    dispatch(
      getShipmentJourney({
        shipment_id: Number(shipmentId),
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* ===================== SEARCH FORM ===================== */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Map className="h-6 w-6 text-purple-600" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Shipment Journey Reconstruction
          </h3>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Reconstruct complete shipment journey with all events and locations
        </p>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Shipment ID
            </label>
            <input
              type="number"
              value={shipmentId}
              onChange={(e) => setShipmentId(e.target.value)}
              placeholder="1"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600
                         rounded-lg bg-white dark:bg-gray-700
                         text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2
                         bg-purple-600 text-white rounded-lg
                         hover:bg-purple-700 disabled:opacity-50"
            >
              <Search className="h-5 w-5" />
              <span>{loading ? 'Loading...' : 'Search'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================== RESULTS ===================== */}
      {shipmentJourney && (
        <div className="space-y-6">
          {/* Shipment Summary */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Package className="h-6 w-6" />
                  <h4 className="text-xl font-bold">
                    {shipmentJourney.tracking_number}
                  </h4>
                </div>
                <p className="text-purple-100 text-sm">
                  {shipmentJourney.origin} → {shipmentJourney.destination}
                </p>
              </div>

              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  shipmentJourney.status === 'delivered'
                    ? 'bg-green-500'
                    : shipmentJourney.status === 'in_transit'
                    ? 'bg-blue-500'
                    : 'bg-yellow-500'
                }`}
              >
                {shipmentJourney.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* ===================== TIMELINE ===================== */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Journey Timeline ({shipmentJourney.events.length} events)
            </h4>

            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-purple-200 dark:bg-purple-800" />

              <div className="space-y-6">
                {shipmentJourney.events.map((event: any, index: number) => (
                  <div
                    key={index}
                    className="relative flex items-start space-x-4 pl-4"
                  >
                    {/* Timeline Dot */}
                    <div className="relative z-10">
                      <div className="w-4 h-4 bg-purple-600 rounded-full border-4 border-white dark:border-gray-800" />
                    </div>

                    {/* Event Card */}
                    <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-semibold text-gray-900 dark:text-white">
                            {event.type.replace(/_/g, ' ').toUpperCase()}
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {format(
                              new Date(event.timestamp),
                              'MMM dd, yyyy HH:mm:ss'
                            )}
                          </p>
                        </div>

                        {event.location && (
                          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>

                      {event.metadata &&
                        Object.keys(event.metadata).length > 0 && (
                          <details className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                            <summary className="cursor-pointer font-medium">
                              Event Details
                            </summary>
                            <pre className="mt-2 bg-white dark:bg-gray-800 rounded p-2 text-xs overflow-auto">
                              {JSON.stringify(event.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
