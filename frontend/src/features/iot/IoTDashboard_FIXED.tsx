// frontend/src/features/iot/IoTDashboard.tsx
// FIXED VERSION - Properly handles WebSocket messages

import React, { useEffect, useState } from 'react';
import { websocketService as wsClient } from '../../services/websocket';

interface SensorData {
  sensor_id: string;
  sensor_type: string;
  value: any;
  timestamp: string;
  battery_level?: number;
  signal_strength?: number;
  location?: string;
}

const IoTDashboard: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [sensors, setSensors] = useState<Map<string, SensorData>>(new Map());
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    console.log('🎯 IoT Dashboard mounted');

    // WebSocket event listeners
    const handleConnected = () => {
      console.log('✅ Dashboard: Connected to server');
      setConnected(true);
    };

    const handleDisconnected = () => {
      console.log('❌ Dashboard: Disconnected from server');
      setConnected(false);
    };

    const handleMessage = (message: any) => {
      console.log('📨 Dashboard received message:', message);
      setMessageCount(prev => prev + 1);

      // Handle different message types
      if (message.type === 'connection') {
        console.log('✅ Connection message:', message.message);
        return;
      }

      if (message.type === 'sensor_update' && message.data) {
        const data = message.data;
        console.log('📡 Sensor update:', data.sensor_id, '=', data.value);
        
        setSensors(prev => {
          const updated = new Map(prev);
          updated.set(data.sensor_id, {
            sensor_id: data.sensor_id,
            sensor_type: data.sensor_type,
            value: data.value,
            timestamp: data.timestamp,
            battery_level: data.battery_level,
            signal_strength: data.signal_strength,
            location: data.location
          });
          console.log(`✅ Updated sensors map. Total: ${updated.size}`);
          return updated;
        });
        
        setLastUpdate(new Date().toLocaleTimeString());
      }
    };

    // Register listeners
    wsClient.on('connected', handleConnected);
    wsClient.on('disconnected', handleDisconnected);
    wsClient.on('message', handleMessage);

    // Initial connection state
    const isConnected = wsClient.isConnected();
    console.log('🔌 Initial connection state:', isConnected);
    setConnected(isConnected);

    // Cleanup
    return () => {
      console.log('🧹 IoT Dashboard unmounting');
      wsClient.off('connected', handleConnected);
      wsClient.off('disconnected', handleDisconnected);
      wsClient.off('message', handleMessage);
    };
  }, []);

  const getSensorsByType = (type: string) => {
    return Array.from(sensors.values()).filter(s => s.sensor_type === type);
  };

  const activeSensorCount = sensors.size;
  const lowBatterySensors = Array.from(sensors.values()).filter(
    s => s.battery_level && s.battery_level < 20
  ).length;

  const avgTemperature = (() => {
    const tempSensors = getSensorsByType('temperature');
    if (tempSensors.length === 0) return 0;
    const sum = tempSensors.reduce((acc, s) => acc + parseFloat(s.value), 0);
    return (sum / tempSensors.length).toFixed(1);
  })();

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          IoT Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Monitor real-time sensor data across your supply chain
        </p>
      </div>

      {/* Connection Status */}
      <div className={`mb-6 p-4 rounded-lg border-2 ${
        connected 
          ? 'bg-green-50 border-green-500 dark:bg-green-900/20' 
          : 'bg-red-50 border-red-500 dark:bg-red-900/20'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className={`font-semibold ${
              connected ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
            }`}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({messageCount} messages)
            </span>
          </div>
          {lastUpdate && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Last update: {lastUpdate}
            </span>
          )}
        </div>
      </div>

      {/* Debug Info */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-300 dark:border-blue-700">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          🔍 Debug Info
        </h3>
        <div className="text-sm space-y-1 text-blue-800 dark:text-blue-400">
          <div>WebSocket Connected: {connected ? '✅ Yes' : '❌ No'}</div>
          <div>Messages Received: {messageCount}</div>
          <div>Sensors in State: {activeSensorCount}</div>
          <div>Last Update: {lastUpdate || 'Never'}</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Active Sensors
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {activeSensorCount}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Expected
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            6
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Low Battery
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {lowBatterySensors}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Avg Temperature
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {avgTemperature}°C
          </div>
        </div>
      </div>

      {/* Sensor Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Live Sensor Data
          </h2>
        </div>

        {!connected && (
          <div className="p-12 text-center">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <svg className="w-16 h-16 mx-auto animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Connecting to live data stream...
            </p>
          </div>
        )}

        {connected && activeSensorCount === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Connected but no sensor data received yet.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              <p>Messages received: {messageCount}</p>
              <p className="mt-2">Make sure IoT simulator is running:</p>
              <code className="block mt-2 p-3 bg-gray-100 dark:bg-gray-900 rounded">
                python scripts/iot_simulator.py
              </code>
            </div>
          </div>
        )}

        {connected && activeSensorCount > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Sensor ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Battery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Signal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Last Update
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {Array.from(sensors.values()).map((sensor) => (
                  <tr key={sensor.sensor_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                      {sensor.sensor_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sensor.sensor_type === 'temperature' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        sensor.sensor_type === 'humidity' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        sensor.sensor_type === 'shock' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        sensor.sensor_type === 'gps' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {sensor.sensor_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                      {sensor.sensor_type === 'gps' 
                        ? `${sensor.value.latitude?.toFixed(4)}, ${sensor.value.longitude?.toFixed(4)}`
                        : typeof sensor.value === 'number' 
                          ? sensor.value.toFixed(2) 
                          : sensor.value}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              (sensor.battery_level || 0) > 50 ? 'bg-green-500' :
                              (sensor.battery_level || 0) > 20 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${sensor.battery_level || 0}%` }}
                          />
                        </div>
                        <span className="text-gray-600 dark:text-gray-400">
                          {sensor.battery_level?.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {sensor.signal_strength ? `${sensor.signal_strength}%` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(sensor.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Console Output */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-white font-mono text-sm mb-2">📊 Recent Activity</h3>
        <div className="text-xs text-gray-300 font-mono space-y-1">
          {Array.from(sensors.values()).slice(-5).map((sensor, idx) => (
            <div key={idx}>
              {new Date(sensor.timestamp).toLocaleTimeString()} - {sensor.sensor_type}: {
                typeof sensor.value === 'object' 
                  ? JSON.stringify(sensor.value).substring(0, 50) 
                  : sensor.value
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IoTDashboard;