import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ShipmentTrendChartProps {
  data: Array<{
    date: string;
    total: number;
    delivered: number;
    inTransit: number;
    delayed: number;
  }>;
}

const ShipmentTrendChart: React.FC<ShipmentTrendChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '0.5rem',
          }}
          labelStyle={{ color: '#F3F4F6' }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#3B82F6"
          strokeWidth={2}
          name="Total Shipments"
          dot={{ fill: '#3B82F6' }}
        />
        <Line
          type="monotone"
          dataKey="delivered"
          stroke="#10B981"
          strokeWidth={2}
          name="Delivered"
          dot={{ fill: '#10B981' }}
        />
        <Line
          type="monotone"
          dataKey="inTransit"
          stroke="#F59E0B"
          strokeWidth={2}
          name="In Transit"
          dot={{ fill: '#F59E0B' }}
        />
        <Line
          type="monotone"
          dataKey="delayed"
          stroke="#EF4444"
          strokeWidth={2}
          name="Delayed"
          dot={{ fill: '#EF4444' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ShipmentTrendChart;