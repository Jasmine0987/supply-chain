// frontend/src/features/carriers/CarriersPage.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Carrier {
  id: number;
  name: string;
  tracking_url: string;
  contact_email: string;
  contact_phone: string;
  is_active: boolean;
}

const CarriersPage: React.FC = () => {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCarriers();
  }, []);

  const fetchCarriers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/v1/carriers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCarriers(response.data);
    } catch (error) {
      console.error('Error fetching carriers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Carriers</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your shipping carriers and logistics partners
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {carriers.map((carrier) => (
          <div key={carrier.id} className="card p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{carrier.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                carrier.is_active 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {carrier.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Email:</strong> {carrier.contact_email}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Phone:</strong> {carrier.contact_phone}
              </p>
              <a 
                href={carrier.tracking_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline block"
              >
                Visit Tracking Page →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarriersPage;