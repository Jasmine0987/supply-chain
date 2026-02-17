import React from 'react';

interface DeviceCardProps {
  device: any;
  onUpdate: (deviceId: string) => void;
  onSelect: (deviceId: string) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onUpdate, onSelect }) => {
  const getDeviceIcon = (type: string) => {
    const icons: Record<string, string> = {
      iot_sensor: '📡',
      raspberry_pi: '🥧',
      jetson_nano: '🤖',
      smartphone: '📱',
    };
    return icons[type] || '📱';
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-600';
    if (level > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 50) return 'text-green-600';
    if (latency < 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-3xl">{getDeviceIcon(device.device_type)}</span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {device.device_id}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {device.device_type.replace('_', ' ')}
            </p>
          </div>
        </div>
        {device.is_charging && (
          <span className="text-green-500 text-sm">⚡ Charging</span>
        )}
      </div>

      {/* Metrics */}
      <div className="space-y-2 mb-4">
        {/* Battery */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Battery</span>
          <div className="flex items-center space-x-2">
            <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  device.battery_level > 60
                    ? 'bg-green-500'
                    : device.battery_level > 30
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${device.battery_level}%` }}
              />
            </div>
            <span className={`text-sm font-semibold ${getBatteryColor(device.battery_level)}`}>
              {device.battery_level.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Network Latency */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Latency</span>
          <span className={`text-sm font-semibold ${getLatencyColor(device.network_latency_ms)}`}>
            {device.network_latency_ms.toFixed(0)} ms
          </span>
        </div>

        {/* Bandwidth */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Bandwidth</span>
          <span className="text-sm font-semibold text-blue-600">
            {device.bandwidth_mbps.toFixed(1)} Mbps
          </span>
        </div>

        {/* CPU Usage */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">CPU</span>
          <span className="text-sm font-semibold text-purple-600">
            {device.cpu_usage_percent?.toFixed(0) || 0}%
          </span>
        </div>

        {/* RAM Available */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">RAM</span>
          <span className="text-sm font-semibold text-indigo-600">
            {device.ram_available_mb?.toFixed(0) || 0} MB
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => onUpdate(device.device_id)}
          className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm font-medium"
        >
          🔄 Update
        </button>
        <button
          onClick={() => onSelect(device.device_id)}
          className="flex-1 px-3 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors text-sm font-medium"
        >
          ⚡ Optimize
        </button>
      </div>

      {/* Timestamp */}
      <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 text-center">
        Last updated: {new Date(device.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default DeviceCard;