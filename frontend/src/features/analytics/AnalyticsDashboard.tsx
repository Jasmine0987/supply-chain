// frontend/src/features/analytics/AnalyticsDashboard.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, DollarSign, Package, Clock } from 'lucide-react';

import Card from '../../components/common/Card';
import ShipmentTrendChart from '../../components/charts/ShipmentTrendChart';
import CostAnalysisChart from '../../components/charts/CostAnalysisChart';
import PerformanceRadarChart from '../../components/charts/PerformanceRadarChart';
import StatCard from '../../components/widgets/StatCard';

type TimeRange = '7d' | '30d' | '90d' | '1y';

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  // -----------------------------------
  // Fetch analytics when range changes
  // -----------------------------------
  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8000/api/v1/analytics?range=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------
  // Fallback data
  // -----------------------------------
  const shipmentTrendData =
    data?.shipmentTrends ?? [
      { date: 'Jan 1', total: 45, delivered: 40, inTransit: 3, delayed: 2 },
      { date: 'Jan 8', total: 52, delivered: 48, inTransit: 3, delayed: 1 },
      { date: 'Jan 15', total: 48, delivered: 45, inTransit: 2, delayed: 1 },
      { date: 'Jan 22', total: 61, delivered: 55, inTransit: 4, delayed: 2 },
      { date: 'Jan 29', total: 58, delivered: 54, inTransit: 3, delayed: 1 },
      { date: 'Feb 5', total: 65, delivered: 60, inTransit: 4, delayed: 1 },
    ];

  const costAnalysisData =
    data?.costAnalysis ?? [
      { carrier: 'FedEx', cost: 12500, shipments: 145, avgCost: 86.2 },
      { carrier: 'UPS', cost: 10200, shipments: 132, avgCost: 77.3 },
      { carrier: 'DHL', cost: 8900, shipments: 98, avgCost: 90.8 },
      { carrier: 'USPS', cost: 6500, shipments: 156, avgCost: 41.7 },
    ];

  const performanceData =
    data?.performance ?? [
      { metric: 'On-Time Delivery', current: 92, target: 95, fullMark: 100 },
      { metric: 'Cost Efficiency', current: 85, target: 90, fullMark: 100 },
      { metric: 'Customer Satisfaction', current: 88, target: 95, fullMark: 100 },
      { metric: 'Inventory Accuracy', current: 94, target: 98, fullMark: 100 },
      { metric: 'Order Fulfillment', current: 90, target: 95, fullMark: 100 },
    ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Comprehensive analytics and performance insights
          </p>
        </div>

        {/* Time Range Buttons */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as TimeRange[]).map((range) => (
            <button
              key={range}
              disabled={loading}
              onClick={() => {
                setTimeRange(range);
                setLoading(true);
                setTimeout(() => setLoading(false), 500);
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                timeRange === range
                  ? 'bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {range === '7d' && 'Last 7 Days'}
              {range === '30d' && 'Last 30 Days'}
              {range === '90d' && 'Last 90 Days'}
              {range === '1y' && 'Last Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading analytics for {timeRange}
          </p>
        </div>
      )}

      {!loading && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Revenue" value={data?.revenue ?? '$142.5K'} icon={DollarSign} color="green" />
            <StatCard title="Total Shipments" value={data?.totalShipments ?? '1,247'} icon={Package} color="blue" />
            <StatCard title="Avg Delivery Time" value={data?.avgDeliveryTime ?? '3.2 days'} icon={Clock} color="purple" />
            <StatCard title="Cost Savings" value={data?.costSavings ?? '$24.8K'} icon={TrendingUp} color="yellow" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Shipment Trends" subtitle="Overview">
              <ShipmentTrendChart data={shipmentTrendData} />
            </Card>

            <Card title="Cost Analysis by Carrier" subtitle="Shipping costs">
              <CostAnalysisChart data={costAnalysisData} />
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Performance Metrics" subtitle="Current vs Target">
              <PerformanceRadarChart data={performanceData} />
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;