import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';
import { format, parseISO, isValid } from 'date-fns';

interface ForecastChartProps {
  data: any[];
  title?: string;
  color?: string;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  data,
  title = 'Forecast',
  color = '#3b82f6',
}) => {
  // Safety check
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No data available</p>
      </div>
    );
  }

  // Format date safely
  const formatDate = (dateStr: any): string => {
    try {
      // Try parsing as ISO string
      let date = parseISO(dateStr);
      
      // If not valid, try Date constructor
      if (!isValid(date)) {
        date = new Date(dateStr);
      }
      
      // If still not valid, return substring
      if (!isValid(date)) {
        console.warn('Invalid date:', dateStr);
        return String(dateStr).substring(0, 10);
      }
      
      return format(date, 'MMM dd');
    } catch (error) {
      console.error('Date formatting error:', dateStr, error);
      return 'Invalid';
    }
  };

  // Transform data safely
  const chartData = data.map((item, index) => {
    try {
      // Handle both 'date' and 'ds' field names
      const dateField = item.date || item.ds || `Day ${index + 1}`;
      
      return {
        date: formatDate(dateField),
        predicted: parseFloat(item.predicted_value || item.yhat || item.value || 0),
        lower: parseFloat(item.lower_bound || item.yhat_lower || 0),
        upper: parseFloat(item.upper_bound || item.yhat_upper || 0),
      };
    } catch (error) {
      console.error('Data transformation error:', item, error);
      return {
        date: `Day ${index + 1}`,
        predicted: 0,
        lower: 0,
        upper: 0,
      };
    }
  });

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          
          {/* Confidence interval area */}
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill={color}
            fillOpacity={0.1}
            name="Upper Bound"
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill={color}
            fillOpacity={0.1}
            name="Lower Bound"
          />
          
          {/* Forecast line */}
          <Line
            type="monotone"
            dataKey="predicted"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 2 }}
            name="Predicted"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForecastChart;