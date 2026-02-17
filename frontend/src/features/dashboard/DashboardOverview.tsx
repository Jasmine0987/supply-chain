import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchDashboardStats } from '../../store/slices/dashboardSlice';
import { Package, TruckIcon, CheckCircle, AlertTriangle } from 'lucide-react';
import StatCard from '../../components/widgets/StatCard';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DashboardOverview: React.FC = () => {
  const dispatch = useAppDispatch();
  const { stats, loading } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  // Sample data for charts
  const deliveryTrendData = [
    { month: 'Jan', deliveries: 245, onTime: 230 },
    { month: 'Feb', deliveries: 280, onTime: 265 },
    { month: 'Mar', deliveries: 320, onTime: 305 },
    { month: 'Apr', deliveries: 290, onTime: 275 },
    { month: 'May', deliveries: 350, onTime: 340 },
    { month: 'Jun', deliveries: 380, onTime: 370 },
  ];

  const warehouseUtilizationData = [
    { name: 'Chicago', utilization: 70 },
    { name: 'LA', utilization: 69 },
    { name: 'New York', utilization: 73 },
    { name: 'Dallas', utilization: 68 },
    { name: 'Seattle', utilization: 70 },
  ];

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome back! Here's what's happening with your supply chain today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Shipments"
          value={stats.totalShipments}
          icon={Package}
          color="blue"
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="In Transit"
          value={stats.inTransit}
          icon={TruckIcon}
          color="yellow"
          trend={{ value: 5.2, isPositive: true }}
        />
        <StatCard
          title="Delivered"
          value={stats.delivered}
          icon={CheckCircle}
          color="green"
          trend={{ value: 8.1, isPositive: true }}
        />
        <StatCard
          title="Active Alerts"
          value={stats.alerts}
          icon={AlertTriangle}
          color="red"
          trend={{ value: 3.2, isPositive: false }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Trend Chart */}
        <Card title="Delivery Trend" subtitle="Last 6 months">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={deliveryTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="deliveries" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Total Deliveries"
              />
              <Line 
                type="monotone" 
                dataKey="onTime" 
                stroke="#10B981" 
                strokeWidth={2}
                name="On-Time Deliveries"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Warehouse Utilization Chart */}
        <Card title="Warehouse Utilization" subtitle="Current capacity usage">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={warehouseUtilizationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '0.5rem'
                }}
              />
              <Bar dataKey="utilization" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card title="Performance Metrics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">On-Time Delivery Rate</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
              {stats.onTimeDeliveryRate.toFixed(1)}%
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Average Delivery Time</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">3.2 days</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Cost Savings (MTD)</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">$24.5K</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardOverview;