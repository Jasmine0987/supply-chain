import React from 'react';
import { useAppSelector } from '../../../store/hooks';

const DamagePredictionView: React.FC = () => {
  const { shipmentReport } = useAppSelector((state) => state.sensorFusion);

  if (!shipmentReport || !shipmentReport.damage_prediction) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No damage prediction data available. Process a shipment to see results.
        </p>
      </div>
    );
  }

  const damagePred = shipmentReport.damage_prediction;

  const getDamageLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-orange-500';
      default: return 'bg-green-500';
    }
  };

  const getDamageLevelBorder = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'border-red-300 dark:border-red-700';
      case 'medium': return 'border-yellow-300 dark:border-yellow-700';
      case 'low': return 'border-orange-300 dark:border-orange-700';
      default: return 'border-green-300 dark:border-green-700';
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        ⚠️ Damage Prediction Analysis
      </h2>

      {/* Main Damage Card */}
      <div className={`border-4 ${getDamageLevelBorder(damagePred.damage_level)} rounded-lg p-8 mb-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900`}>
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">
            {damagePred.damage_level === 'high' && '🚨'}
            {damagePred.damage_level === 'medium' && '⚠️'}
            {damagePred.damage_level === 'low' && '⚡'}
            {damagePred.damage_level === 'minimal' && '✅'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Overall Damage Probability
          </div>
          <div className="text-6xl font-bold mb-4" style={{
            color: damagePred.damage_level === 'high' ? '#dc2626' :
                   damagePred.damage_level === 'medium' ? '#eab308' :
                   damagePred.damage_level === 'low' ? '#f97316' : '#10b981'
          }}>
            {(damagePred.final_damage_probability * 100).toFixed(1)}%
          </div>
          <div className={`inline-block px-6 py-2 rounded-full text-white font-bold text-lg ${getDamageLevelColor(damagePred.damage_level)}`}>
            {damagePred.damage_level.toUpperCase()} RISK
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 mb-4">
          <div
            className={`h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${getDamageLevelColor(damagePred.damage_level)}`}
            style={{ width: `${damagePred.final_damage_probability * 100}%` }}
          >
            {(damagePred.final_damage_probability * 100).toFixed(0)}%
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {damagePred.timeline?.length || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Data Points
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {(damagePred.peak_instant_damage * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Peak Instant Damage
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {(damagePred.total_exposure_time / 3600).toFixed(1)}h
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Total Exposure
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {damagePred.recommendations?.length || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Recommendations
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      {damagePred.timeline && damagePred.timeline.length > 0 && (
        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            📈 Damage Timeline
          </h3>
          <div className="h-64 flex items-end space-x-1">
            {damagePred.timeline.slice(0, 50).map((point: any, idx: number) => {
              const height = point.instant_damage * 100;
              return (
                <div
                  key={idx}
                  className="flex-1 bg-gradient-to-t from-red-500 to-orange-400 rounded-t"
                  style={{ height: `${height}%`, minHeight: '2px' }}
                  title={`${(point.instant_damage * 100).toFixed(1)}%`}
                />
              );
            })}
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            Instant damage probability over time (first 50 points shown)
          </div>
        </div>
      )}

      {/* Recommendations */}
      {damagePred.recommendations && damagePred.recommendations.length > 0 && (
        <div className={`border-2 ${getDamageLevelBorder(damagePred.damage_level)} rounded-lg p-6 mb-6`}>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="text-2xl mr-2">💡</span>
            Action Items & Recommendations
          </h3>
          <div className="space-y-3">
            {damagePred.recommendations.map((rec: string, idx: number) => (
              <div
                key={idx}
                className="flex items-start p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                  <span className="text-blue-600 dark:text-blue-300 font-bold text-sm">
                    {idx + 1}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                  {rec}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Assessment Summary */}
      <div className="bg-white dark:bg-gray-700 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          📋 Risk Assessment Summary
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-600">
            <span className="text-gray-600 dark:text-gray-400">Risk Level</span>
            <span className={`font-bold text-lg ${
              damagePred.damage_level === 'high' ? 'text-red-600' :
              damagePred.damage_level === 'medium' ? 'text-yellow-600' :
              damagePred.damage_level === 'low' ? 'text-orange-600' : 'text-green-600'
            }`}>
              {damagePred.damage_level.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-600">
            <span className="text-gray-600 dark:text-gray-400">Probability</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {(damagePred.final_damage_probability * 100).toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-600">
            <span className="text-gray-600 dark:text-gray-400">Peak Damage</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {(damagePred.peak_instant_damage * 100).toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Recommended Action</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {damagePred.damage_level === 'high' ? 'Immediate Inspection' :
               damagePred.damage_level === 'medium' ? 'Detailed Inspection' :
               damagePred.damage_level === 'low' ? 'Standard Inspection' :
               'Normal Processing'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DamagePredictionView;