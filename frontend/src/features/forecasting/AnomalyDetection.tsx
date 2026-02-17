import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface Anomaly {
  date: string;
  actual: number;
  predicted: number;
  lower_bound: number;
  upper_bound: number;
  severity: number;
}

interface AnomalyDetectionProps {
  anomalies: Anomaly[];
  severityDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

export const AnomalyDetection: React.FC<AnomalyDetectionProps> = ({
  anomalies,
  severityDistribution,
}) => {
  // Prepare chart data
  const chartData = anomalies.map((anomaly) => ({
    date: format(new Date(anomaly.date), 'MMM dd'),
    fullDate: anomaly.date,
    actual: anomaly.actual,
    predicted: anomaly.predicted,
    deviation: Math.abs(anomaly.actual - anomaly.predicted),
    severity: anomaly.severity,
  }));

  // Get severity color
  const getSeverityColor = (severity: number) => {
    if (severity < 1.5) return '#10b981'; // Green
    if (severity < 2.5) return '#f59e0b'; // Orange
    if (severity < 3.5) return '#ef4444'; // Red
    return '#dc2626'; // Dark red
  };

  // Get severity label
  const getSeverityLabel = (severity: number) => {
    if (severity < 1.5) return 'Low';
    if (severity < 2.5) return 'Medium';
    if (severity < 3.5) return 'High';
    return 'Critical';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Low Severity</p>
              <p className="text-2xl font-bold text-green-600">
                {severityDistribution.low}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Medium</p>
              <p className="text-2xl font-bold text-orange-600">
                {severityDistribution.medium}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">High</p>
              <p className="text-2xl font-bold text-red-600">
                {severityDistribution.high}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
              <p className="text-2xl font-bold text-red-700">
                {severityDistribution.critical}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-200 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Anomaly Scatter Plot */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Anomaly Timeline
        </h3>

        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              label={{
                value: 'Deviation',
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#9ca3af' },
              }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
              labelStyle={{ color: '#9ca3af' }}
              formatter={(value: unknown, name?: string) => {
                const safeName = name ?? 'Value';
                if (safeName === 'severity') {
                  return [getSeverityLabel(Number(value)), 'Severity'];
                }
                return [String(Math.round(Number(value))), safeName];
              }}
            />
            <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />

            <Scatter
              name="Anomalies"
              data={chartData}
              fill="#ef4444"
              shape={(props: any) => {
                const { cx, cy, payload } = props;
                const color = getSeverityColor(payload.severity);
                const size = Math.max(6, payload.severity * 3);
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={size}
                    fill={color}
                    opacity={0.7}
                    stroke={color}
                    strokeWidth={2}
                  />
                );
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Anomaly List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Detected Anomalies
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Actual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Predicted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Deviation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Severity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {anomalies.map((anomaly, index) => {
                const deviation = Math.abs(anomaly.actual - anomaly.predicted);
                const deviationPercent = (
                  (deviation / anomaly.predicted) *
                  100
                ).toFixed(1);
                const severityLabel = getSeverityLabel(anomaly.severity);
                const severityColor = getSeverityColor(anomaly.severity);

                return (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {format(new Date(anomaly.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {Math.round(anomaly.actual)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(anomaly.predicted)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {Math.round(deviation)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1">
                        ({deviationPercent}%)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${severityColor}20`,
                          color: severityColor,
                        }}
                      >
                        {severityLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};