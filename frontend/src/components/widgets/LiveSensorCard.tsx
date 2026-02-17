import React from 'react';
import { Thermometer, Droplets, Radio, Zap, Battery, Signal } from 'lucide-react';
import { clsx } from 'clsx';
import Card from '../common/Card';

interface LiveSensorCardProps {
  deviceId: string;
  sensorType: string;
  value: any;
  unit?: string;
  batteryLevel?: number | null;
  signalStrength?: number | null;
  timestamp?: string;
}

const LiveSensorCard: React.FC<LiveSensorCardProps> = ({
  deviceId,
  sensorType,
  value,
  unit,
  batteryLevel,
  signalStrength,
  timestamp,
}) => {
  const getIcon = () => {
    switch (sensorType) {
      case 'temperature':
        return <Thermometer className="h-6 w-6" />;
      case 'humidity':
        return <Droplets className="h-6 w-6" />;
      case 'shock':
        return <Zap className="h-6 w-6" />;
      case 'gps':
        return <Radio className="h-6 w-6" />;
      default:
        return <Radio className="h-6 w-6" />;
    }
  };

  const getValueDisplay = () => {
    if (sensorType === 'gps' && typeof value === 'object') {
      return `${value.latitude?.toFixed(4)}, ${value.longitude?.toFixed(4)}`;
    }
    return typeof value === 'number' ? value.toFixed(2) : value;
  };

  const getStatusColor = () => {
    if (sensorType === 'temperature' && typeof value === 'number') {
      if (value > 25) return 'text-red-600';
      if (value < 15) return 'text-blue-600';
      return 'text-green-600';
    }
    return 'text-blue-600';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className={clsx('p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20', getStatusColor())}>
            {getIcon()}
          </div>
          <div className="flex items-center gap-2">
            {batteryLevel !== null && batteryLevel !== undefined && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Battery className="h-3 w-3" />
                <span>{batteryLevel}%</span>
              </div>
            )}
            {signalStrength !== null && signalStrength !== undefined && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Signal className="h-3 w-3" />
                <span>{signalStrength}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Value */}
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
            {sensorType.replace('_', ' ')}
          </p>
          <p className={clsx('text-2xl font-bold mt-1', getStatusColor())}>
            {getValueDisplay()}
            {unit && <span className="text-lg ml-1">{unit}</span>}
          </p>
        </div>

        {/* Device ID */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
            {deviceId}
          </p>
          {timestamp && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {new Date(timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default LiveSensorCard;