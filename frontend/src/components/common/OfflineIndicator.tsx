import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-down">
      <div
        className={`
          flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg
          ${
            isOnline
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
          }
        `}
      >
        {isOnline ? (
          <Wifi className="h-5 w-5 text-green-600 dark:text-green-400" />
        ) : (
          <WifiOff className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        )}
        <div>
          <p
            className={`text-sm font-medium ${
              isOnline
                ? 'text-green-800 dark:text-green-200'
                : 'text-orange-800 dark:text-orange-200'
            }`}
          >
            {isOnline ? 'Back Online' : 'You are offline'}
          </p>
          <p
            className={`text-xs ${
              isOnline
                ? 'text-green-600 dark:text-green-300'
                : 'text-orange-600 dark:text-orange-300'
            }`}
          >
            {isOnline
              ? 'Your connection has been restored'
              : 'Changes will sync when you reconnect'}
          </p>
        </div>
      </div>
    </div>
  );
};