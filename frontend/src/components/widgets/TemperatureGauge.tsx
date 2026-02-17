import React from 'react';
import { Thermometer } from 'lucide-react';
import { clsx } from 'clsx';

interface TemperatureGaugeProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
}

const TemperatureGauge: React.FC<TemperatureGaugeProps> = ({
  value,
  min = 0,
  max = 40,
  label = 'Temperature',
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  const getColor = () => {
    if (value > 25) return 'bg-red-500';
    if (value > 20) return 'bg-yellow-500';
    if (value > 15) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getTextColor = () => {
    if (value > 25) return 'text-red-600 dark:text-red-400';
    if (value > 20) return 'text-yellow-600 dark:text-yellow-400';
    if (value > 15) return 'text-green-600 dark:text-green-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</h3>
        <Thermometer className={clsx('h-5 w-5', getTextColor())} />
      </div>

      <div className="flex items-center gap-4">
        {/* Vertical gauge */}
        <div className="relative h-40 w-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={clsx('absolute bottom-0 w-full transition-all duration-500 rounded-full', getColor())}
            style={{ height: `${clampedPercentage}%` }}
          />
        </div>

        {/* Value display */}
        <div>
          <p className={clsx('text-4xl font-bold', getTextColor())}>{value.toFixed(1)}</p>
          <p className="text-2xl text-gray-400">°C</p>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            <p>Min: {min}°C</p>
            <p>Max: {max}°C</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemperatureGauge;