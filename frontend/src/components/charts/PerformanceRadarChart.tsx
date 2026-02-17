import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceRadarChartProps {
  data: Array<{
    metric: string;
    current: number;
    target: number;
    fullMark: number;
  }>;
}

const PerformanceRadarChart: React.FC<PerformanceRadarChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart data={data}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" />
        <PolarRadiusAxis stroke="#9CA3AF" />
        <Radar
          name="Current"
          dataKey="current"
          stroke="#3B82F6"
          fill="#3B82F6"
          fillOpacity={0.6}
        />
        <Radar
          name="Target"
          dataKey="target"
          stroke="#10B981"
          fill="#10B981"
          fillOpacity={0.3}
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default PerformanceRadarChart;