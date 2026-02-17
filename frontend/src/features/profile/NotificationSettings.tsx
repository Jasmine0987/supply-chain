// frontend/src/features/profile/NotificationSettings.tsx

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../store/hooks';

interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

const NotificationSettings: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: 'shipment_updates',
      label: 'Shipment Updates',
      description: 'Notifications about shipment status changes',
      email: true,
      push: true,
      sms: false,
    },
    {
      id: 'critical_alerts',
      label: 'Critical Alerts',
      description: 'Urgent notifications requiring immediate attention',
      email: true,
      push: true,
      sms: true,
    },
    {
      id: 'inventory_alerts',
      label: 'Inventory Alerts',
      description: 'Low stock and inventory warnings',
      email: true,
      push: false,
      sms: false,
    },
    {
      id: 'anomaly_detection',
      label: 'Anomaly Detection',
      description: 'Alerts when anomalies are detected in shipments or sensors',
      email: true,
      push: true,
      sms: false,
    },
    {
      id: 'forecast_updates',
      label: 'Forecast Updates',
      description: 'New demand forecasts and predictions',
      email: false,
      push: false,
      sms: false,
    },
    {
      id: 'daily_reports',
      label: 'Daily Reports',
      description: 'Daily summary of operations and metrics',
      email: true,
      push: false,
      sms: false,
    },
    {
      id: 'weekly_reports',
      label: 'Weekly Reports',
      description: 'Weekly analytics and performance reports',
      email: true,
      push: false,
      sms: false,
    },
    {
      id: 'iot_warnings',
      label: 'IoT Sensor Warnings',
      description: 'Temperature, shock, and other sensor alerts',
      email: true,
      push: true,
      sms: false,
    },
    {
      id: 'route_delays',
      label: 'Route Delays',
      description: 'Notifications about transportation delays',
      email: true,
      push: false,
      sms: false,
    },
    {
      id: 'system_updates',
      label: 'System Updates',
      description: 'Platform updates and maintenance notifications',
      email: false,
      push: false,
      sms: false,
    },
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Load preferences from API (if available)
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/v1/profile/notification-preferences');
      // const data = await response.json();
      // setPreferences(data.preferences);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleToggle = (id: string, channel: 'email' | 'push' | 'sms') => {
    setPreferences((prev) =>
      prev.map((pref) =>
        pref.id === id
          ? { ...pref, [channel]: !pref[channel] }
          : pref
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      // TODO: Replace with actual API call
      // await fetch('/api/v1/profile/notification-preferences', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ preferences }),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSaveMessage('Notification preferences saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error saving preferences. Please try again.');
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectAll = (channel: 'email' | 'push' | 'sms') => {
    setPreferences((prev) =>
      prev.map((pref) => ({ ...pref, [channel]: true }))
    );
  };

  const handleDeselectAll = (channel: 'email' | 'push' | 'sms') => {
    setPreferences((prev) =>
      prev.map((pref) => ({ ...pref, [channel]: false }))
    );
  };

  const getChannelCount = (channel: 'email' | 'push' | 'sms') => {
    return preferences.filter((pref) => pref[channel]).length;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Notification Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage how you receive notifications about your supply chain operations
        </p>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            saveMessage.includes('Error')
              ? 'bg-red-100 border border-red-400 text-red-700'
              : 'bg-green-100 border border-green-400 text-green-700'
          }`}
        >
          {saveMessage}
        </div>
      )}

      {/* Channel Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-blue-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Email
              </h3>
            </div>
            <span className="text-2xl font-bold text-blue-500">
              {getChannelCount('email')}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {getChannelCount('email')} of {preferences.length} enabled
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleSelectAll('email')}
              className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Enable All
            </button>
            <button
              onClick={() => handleDeselectAll('email')}
              className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Disable All
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Push
              </h3>
            </div>
            <span className="text-2xl font-bold text-green-500">
              {getChannelCount('push')}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {getChannelCount('push')} of {preferences.length} enabled
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleSelectAll('push')}
              className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Enable All
            </button>
            <button
              onClick={() => handleDeselectAll('push')}
              className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Disable All
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-purple-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                SMS
              </h3>
            </div>
            <span className="text-2xl font-bold text-purple-500">
              {getChannelCount('sms')}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {getChannelCount('sms')} of {preferences.length} enabled
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleSelectAll('sms')}
              className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
            >
              Enable All
            </button>
            <button
              onClick={() => handleDeselectAll('sms')}
              className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Disable All
            </button>
          </div>
        </div>
      </div>

      {/* Preferences Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Notification Type
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Push
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  SMS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {preferences.map((pref) => (
                <tr
                  key={pref.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {pref.label}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {pref.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pref.email}
                        onChange={() => handleToggle(pref.id, 'email')}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </label>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pref.push}
                        onChange={() => handleToggle(pref.id, 'push')}
                        className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </label>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pref.sms}
                        onChange={() => handleToggle(pref.id, 'sms')}
                        className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={loadPreferences}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </button>
      </div>

      {/* Info Card */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div className="flex">
          <svg
            className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-blue-700 dark:text-blue-200">
            <p className="font-medium mb-1">About Notification Channels:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Email:</strong> Detailed notifications sent to{' '}
                {user?.email || 'your registered email'}
              </li>
              <li>
                <strong>Push:</strong> Instant notifications on your device (requires browser
                permission)
              </li>
              <li>
                <strong>SMS:</strong> Text messages for critical alerts (standard SMS rates may
                apply)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;