// frontend/src/features/dashboard/ExecutiveDashboard.tsx

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchDashboardStats } from '../../store/slices/dashboardSlice';

const ExecutiveDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { stats, loading } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <div className="mt-4 text-center text-gray-600 dark:text-gray-400 font-medium">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Animated Header */}
      <div className="mb-8 relative overflow-hidden rounded-2xl p-8 gradient-animated text-white">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">
            Dashboard Overview
          </h1>
          <p className="text-white text-opacity-90 text-lg">
            Welcome back! Here's what's happening with your supply chain today.
          </p>
        </div>
        <div className="absolute top-0 right-0 opacity-10">
          <svg className="w-64 h-64" viewBox="0 0 24 24" fill="white">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
          </svg>
        </div>
      </div>

      {/* KPI Cards with Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Shipments - Blue Gradient */}
        <div className="relative overflow-hidden rounded-xl shadow-lg card-hover">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700"></div>
          <div className="relative p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm font-medium">vs last month</p>
                <p className="text-2xl font-bold">+12.5%</p>
              </div>
            </div>
            <p className="text-blue-100 text-sm font-medium mb-1">Total Shipments</p>
            <p className="text-4xl font-bold">{stats?.totalShipments || 50}</p>
          </div>
        </div>

        {/* In Transit - Purple Gradient */}
        <div className="relative overflow-hidden rounded-xl shadow-lg card-hover">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-700"></div>
          <div className="relative p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-purple-100 text-sm font-medium">vs last month</p>
                <p className="text-2xl font-bold">+5.2%</p>
              </div>
            </div>
            <p className="text-purple-100 text-sm font-medium mb-1">In Transit</p>
            <p className="text-4xl font-bold">{stats?.inTransit || 12}</p>
          </div>
        </div>

        {/* Delivered - Green Gradient */}
        <div className="relative overflow-hidden rounded-xl shadow-lg card-hover">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-700"></div>
          <div className="relative p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-green-100 text-sm font-medium">vs last month</p>
                <p className="text-2xl font-bold">+8.1%</p>
              </div>
            </div>
            <p className="text-green-100 text-sm font-medium mb-1">Delivered</p>
            <p className="text-4xl font-bold">{stats?.delivered || 14}</p>
          </div>
        </div>

        {/* Active Alerts - Red/Orange Gradient */}
        <div className="relative overflow-hidden rounded-xl shadow-lg card-hover">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600"></div>
          <div className="relative p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm pulse-slow">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-orange-100 text-sm font-medium">vs last month</p>
                <p className="text-2xl font-bold">-3.2%</p>
              </div>
            </div>
            <p className="text-orange-100 text-sm font-medium mb-1">Active Alerts</p>
            <p className="text-4xl font-bold">{stats?.alerts || 6}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Delivery Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 card-hover">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></span>
              Delivery Trends
            </h3>
            <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Chart placeholder - Recharts integration</p>
          </div>
        </div>

        {/* Warehouse Utilization */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 card-hover">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-gradient-to-b from-green-500 to-teal-600 rounded-full"></span>
            Warehouse Utilization
          </h3>
          <div className="space-y-4">
            {['Chicago', 'Los Angeles', 'New York', 'Dallas', 'Seattle'].map((city, idx) => (
              <div key={city}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{city}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{70 + idx * 2}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${70 + idx * 2}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 card-hover">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <span className="w-2 h-8 bg-gradient-to-b from-yellow-500 to-orange-600 rounded-full"></span>
          Performance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl">
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-300 mb-2">98.6%</p>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">On-Time Delivery Rate</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-xl">
            <p className="text-4xl font-bold text-green-600 dark:text-green-300 mb-2">3.2 days</p>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">Average Delivery Time</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-xl">
            <p className="text-4xl font-bold text-purple-600 dark:text-purple-300 mb-2">$24.5K</p>
            <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Cost Savings (MTD)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;