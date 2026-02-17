import React from 'react';
import { useAppSelector } from '../../store/hooks';
import LiveSensorCard from './LiveSensorCard';
import Spinner from '../common/Spinner';

const LiveDataGrid: React.FC = () => {
  const { sensors, isConnected } = useAppSelector((state) => state.realtime);

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">Connecting to live data stream...</p>
        <Spinner size="md" />
      </div>
    );
  }

  if (sensors.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">No sensor data available</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Start the IoT simulator to see live data
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sensors.map((sensor) => (
        <LiveSensorCard
          key={sensor.device_id}
          deviceId={sensor.device_id}
          sensorType={sensor.sensor_type}
          value={sensor.last_reading?.value}
          unit={sensor.last_reading?.unit}
          batteryLevel={sensor.battery_level}
          signalStrength={sensor.signal_strength}
          timestamp={sensor.last_reading?.timestamp}
        />
      ))}
    </div>
  );
};

export default LiveDataGrid;