import React from 'react';
import { DollarSign, Fuel, User, Wrench, MapPin, Leaf } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CostBreakdownProps {
  costAnalysis: {
    total_cost: number;
    breakdown: {
      fuel: number;
      driver: number;
      maintenance: number;
      stops: number;
      time_window_penalty: number;
      carbon_offset: number;
    };
    metrics: {
      distance_km: number;
      duration_hours: number;
      cost_per_km: number;
      num_stops: number;
    };
  };
  distance?: number;
}

export const CostBreakdown: React.FC<CostBreakdownProps> = ({ costAnalysis, distance }) => {
  if (!costAnalysis) return null;

  const { total_cost, breakdown, metrics } = costAnalysis;

  // Prepare data for pie chart
  const chartData = [
    { name: 'Fuel', value: breakdown.fuel, color: '#ef4444' },
    { name: 'Driver', value: breakdown.driver, color: '#3b82f6' },
    { name: 'Maintenance', value: breakdown.maintenance, color: '#f59e0b' },
    { name: 'Stops', value: breakdown.stops, color: '#10b981' },
    { name: 'Carbon', value: breakdown.carbon_offset, color: '#22c55e' },
  ];

  const costItems = [
    {
      label: 'Fuel Cost',
      value: breakdown.fuel,
      icon: Fuel,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
    {
      label: 'Driver Cost',
      value: breakdown.driver,
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      label: 'Maintenance',
      value: breakdown.maintenance,
      icon: Wrench,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
    {
      label: 'Stop Handling',
      value: breakdown.stops,
      icon: MapPin,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      label: 'Carbon Offset',
      value: breakdown.carbon_offset,
      icon: Leaf,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Cost Breakdown
        </h3>
        <div className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            ${total_cost.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Cost Items */}
      <div className="space-y-3 mb-6">
        {costItems.map((item, index) => {
          const Icon = item.icon;
          const percentage = (item.value / total_cost) * 100;

          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className={`${item.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.label}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color.replace('text', 'bg')}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white ml-3">
                  ${item.value.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pie Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => `$${value.toFixed(2)}`}
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Metrics */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Route Metrics
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Distance</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {(distance || metrics.distance_km).toFixed(2)} km
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Duration</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {metrics.duration_hours.toFixed(1)} hrs
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Cost/km</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              ${metrics.cost_per_km.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Stops</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {metrics.num_stops}
            </p>
          </div>
        </div>
      </div>

      {/* Savings Indicator */}
      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center space-x-2">
          <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-sm font-medium text-green-900 dark:text-green-200">
              Eco-Friendly Route
            </p>
            <p className="text-xs text-green-700 dark:text-green-300">
              Carbon offset included: ${breakdown.carbon_offset.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};