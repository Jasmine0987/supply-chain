import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { clsx } from 'clsx';

const ConnectionStatus: React.FC = () => {
  const { isConnected, lastUpdate } = useAppSelector((state) => state.realtime);

  return (
    <div
      className={clsx(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
        isConnected
          ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
          : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
      )}
    >
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4 animate-pulse" />
          <span className="font-medium">Live</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span className="font-medium">Disconnected</span>
        </>
      )}
      {lastUpdate && isConnected && (
        <span className="text-xs opacity-75">
          Updated {new Date(lastUpdate).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default ConnectionStatus;