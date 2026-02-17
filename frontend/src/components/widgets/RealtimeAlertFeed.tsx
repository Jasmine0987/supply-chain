import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { clsx } from 'clsx';

interface AlertItem {
  id: string;
  type: 'warning' | 'danger' | 'info';
  message: string;
  timestamp: Date;
}

const RealtimeAlertFeed: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    // Simulate receiving alerts
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newAlert: AlertItem = {
          id: Date.now().toString(),
          type: Math.random() > 0.5 ? 'warning' : 'danger',
          message: `Sensor alert: ${
            Math.random() > 0.5
              ? 'Temperature exceeded threshold'
              : 'Low battery detected'
          }`,
          timestamp: new Date(),
        };

        setAlerts((prev) => [newAlert, ...prev].slice(0, 5));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={clsx(
            'flex items-start gap-3 p-4 rounded-lg shadow-lg backdrop-blur-sm animate-slide-in-right',
            {
              'bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800':
                alert.type === 'warning',
              'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800':
                alert.type === 'danger',
              'bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800':
                alert.type === 'info',
            }
          )}
        >
          <AlertTriangle
            className={clsx('h-5 w-5 flex-shrink-0 mt-0.5', {
              'text-yellow-600': alert.type === 'warning',
              'text-red-600': alert.type === 'danger',
              'text-blue-600': alert.type === 'info',
            })}
          />

          <div className="flex-1 min-w-0">
            <p
              className={clsx('text-sm font-medium', {
                'text-yellow-800 dark:text-yellow-200':
                  alert.type === 'warning',
                'text-red-800 dark:text-red-200':
                  alert.type === 'danger',
                'text-blue-800 dark:text-blue-200':
                  alert.type === 'info',
              })}
            >
              {alert.message}
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {alert.timestamp.toLocaleTimeString()}
            </p>
          </div>

          <button
            onClick={() => removeAlert(alert.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default RealtimeAlertFeed;
