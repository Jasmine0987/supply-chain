import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAlerts, resolveAlert } from '../../store/slices/alertsSlice';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Thermometer,
} from 'lucide-react';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';

type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';


const AlertCenter: React.FC = () => {
  const dispatch = useAppDispatch();
  const { alerts, loading } = useAppSelector((state) => state.alerts);

  const [statusFilter, setStatusFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | AlertSeverity>('all');
  const [resolvingIds, setResolvingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    dispatch(fetchAlerts());
  }, [dispatch]);

  // Handle resolve alert
  const handleResolve = async (alertId: number) => {
    setResolvingIds((prev) => new Set(prev).add(alertId));
    
    try {
      await dispatch(resolveAlert(alertId)).unwrap();
      // Success - the alert will be updated in Redux state
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      alert('Failed to resolve alert. Please try again.');
    } finally {
      setResolvingIds((prev) => {
        const next = new Set(prev);
        next.delete(alertId);
        return next;
      });
    }
  };

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'resolved' && alert.resolved) ||
      (statusFilter === 'unresolved' && !alert.resolved);

    const matchesSeverity =
      severityFilter === 'all' || alert.severity === severityFilter;

    return matchesStatus && matchesSeverity;
  });

  // Count by severity
  const criticalCount = alerts.filter((a) => a.severity === 'critical' && !a.resolved).length;
  const highCount = alerts.filter((a) => a.severity === 'high' && !a.resolved).length;
  const mediumCount = alerts.filter((a) => a.severity === 'medium' && !a.resolved).length;
  const lowCount = alerts.filter((a) => a.severity === 'low' && !a.resolved).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Alerts & Notifications
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Monitor and manage system alerts and notifications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{criticalCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">High</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{highCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Medium</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{mediumCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Low</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{lowCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              All Alerts
            </button>
            <button
              onClick={() => setStatusFilter('unresolved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                statusFilter === 'unresolved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Unresolved
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                statusFilter === 'resolved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Resolved
            </button>
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No alerts found</p>
            </div>
          </Card>
        ) : (
          filteredAlerts.map((alert) => {
            const isResolving = resolvingIds.has(alert.id);
            
            return (
              <Card key={alert.id}>
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {getAlertIcon(alert.alert_type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {alert.title || `Alert ${alert.id}`}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(
                          alert.severity
                        )}`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                      {alert.resolved && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          RESOLVED
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {alert.message}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(alert.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>•</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {alert.alert_type}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {!alert.resolved && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      disabled={isResolving}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isResolving
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {isResolving ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          Resolving...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Mark Resolved
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Footer */}
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        Showing {filteredAlerts.length} of {alerts.length} alerts
      </p>
    </div>
  );
};

// Helper: Get alert icon
const getAlertIcon = (type: string) => {
  const className = "h-8 w-8";
  
  switch (type) {
    case 'delay':
      return <Clock className={`${className} text-orange-500`} />;
    case 'stock low':
      return <Package className={`${className} text-red-500`} />;
    case 'temperature':
      return <Thermometer className={`${className} text-blue-500`} />;
    default:
      return <AlertTriangle className={`${className} text-yellow-500`} />;
  }
};

// Helper: Get severity color
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'low':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export default AlertCenter;