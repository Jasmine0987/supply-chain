// frontend/src/features/shipments/ShipmentDetail.tsx

// frontend/src/features/shipments/ShipmentDetail.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Shipment {
  id: number;
  tracking_number: string;
  status: string;
  priority: string;
  origin: string;
  destination: string;
  current_location: string;
  estimated_delivery: string;
  carrier_name?: string;
  weight?: number;
  notes?: string;
}

const ShipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchShipmentDetail();
  }, [id]);

  const fetchShipmentDetail = async () => {
    try {
      setLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`http://localhost:8000/api/v1/shipments/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}` // Add auth token
        }
      });
      
      setShipment(response.data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching shipment:', err);
      
      if (err.response?.status === 401) {
        setError('Authentication required. Please login again.');
        // Redirect to login after 2 seconds
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(err.message || 'Failed to load shipment details');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading shipment details...</p>
        </div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border-2 border-red-300 dark:border-red-700 rounded-xl p-8 text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-300 mb-2">
            Error Loading Shipment
          </h2>
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Shipment not found'}</p>
          <button
            onClick={() => navigate('/shipments')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            ← Back to Shipments
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'IN TRANSIT': 'bg-blue-100 text-blue-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'EXCEPTION': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'URGENT': 'text-red-600',
      'HIGH': 'text-orange-600',
      'NORMAL': 'text-blue-600',
    };
    return colors[priority] || 'text-gray-600';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/shipments')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Shipments
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Shipment Details
        </h1>
      </div>

      {/* Tracking Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tracking Number</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {shipment.tracking_number}
            </p>
          </div>
          <div className="flex gap-3">
            <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(shipment.status)}`}>
              {shipment.status}
            </span>
            <span className={`px-4 py-2 font-semibold ${getPriorityColor(shipment.priority)}`}>
              {shipment.priority}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Shipment Journey
          </h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
            
            {/* Origin */}
            <div className="relative flex items-start mb-8">
              <div className="absolute left-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-12">
                <p className="font-semibold text-gray-900 dark:text-white">Origin</p>
                <p className="text-gray-600 dark:text-gray-400">{shipment.origin}</p>
              </div>
            </div>

            {/* Current Location */}
            <div className="relative flex items-start mb-8">
              <div className="absolute left-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-12">
                <p className="font-semibold text-gray-900 dark:text-white">Current Location</p>
                <p className="text-gray-600 dark:text-gray-400">{shipment.current_location}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">In Progress</p>
              </div>
            </div>

            {/* Destination */}
            <div className="relative flex items-start">
              <div className="absolute left-0 w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>
              <div className="ml-12">
                <p className="font-semibold text-gray-900 dark:text-white">Destination</p>
                <p className="text-gray-600 dark:text-gray-400">{shipment.destination}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  ETA: {new Date(shipment.estimated_delivery).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipment Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Shipment Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Carrier:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {shipment.carrier_name || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Weight:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {shipment.weight ? `${shipment.weight} kg` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className={`font-semibold ${getStatusColor(shipment.status)} px-3 py-1 rounded`}>
                {shipment.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Priority:</span>
              <span className={`font-semibold ${getPriorityColor(shipment.priority)}`}>
                {shipment.priority}
              </span>
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Live Tracking Map
          </h3>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">
                Map tracking requires Mapbox token
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Add VITE_MAPBOX_TOKEN to .env
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {shipment.notes && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Notes
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{shipment.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ShipmentDetail;