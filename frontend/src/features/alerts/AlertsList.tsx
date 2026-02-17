import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAlerts } from '../../store/slices/alertsSlice';
import { AlertTriangle, CheckCircle, Clock} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import { format } from 'date-fns';
import { Alert } from '../../types';

const AlertsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { alerts, loading } = useAppSelector((state) => state.alerts);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');
  const [severityFilter, setSeverityFilter] = useState<string>('');

  useEffect(() => {
    const isResolved = filter === 'resolved' ? true : filter === 'unresolved' ? false : undefined;
    dispatch(fetchAlerts({ isResolved, severity: severityFilter || undefined }));
  }, [dispatch, filter, severityFilter]);

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      critical: 'danger',
      high: 'danger',
      medium: 'warning',
      low: 'info',
    };
    return <Badge variant={variants[severity] || 'default'}>{severity.toUpperCase()}</Badge>;
  };

  const getAlertIcon = (severity: string) => {
    const color = severity === 'critical' || severity === 'high' ? 'text-red-600' : severity === 'medium' ? 'text-yellow-600' : 'text-blue-600';
    return <AlertTriangle className={`h-5 w-5 ${color}`} />;
  };

  const severityCount = {
    critical: alerts.filter((a) => a.severity === 'critical' && !a.is_resolved).length,
    high: alerts.filter((a) => a.severity === 'high' && !a.is_resolved).length,
    medium: alerts.filter((a) => a.severity === 'medium' && !a.is_resolved).length,
    low: alerts.filter((a) => a.severity === 'low' && !a.is_resolved).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alerts & Notifications</h1>
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
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {severityCount.critical}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">High</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                {severityCount.high}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Medium</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                {severityCount.medium}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Low</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {severityCount.low}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All Alerts
          </button>
          <button
            onClick={() => setFilter('unresolved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unresolved'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Unresolved
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'resolved'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Resolved
          </button>

          <div className="flex-1"></div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No alerts found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filter === 'unresolved'
                  ? 'Great! All alerts have been resolved.'
                  : 'There are no alerts matching your filters.'}
              </p>
            </div>
          </Card>
        ) : (
          alerts.map((alert: Alert) => (
            <Card key={alert.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">{getAlertIcon(alert.severity)}</div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          {alert.title}
                        </h3>
                        {getSeverityBadge(alert.severity)}
                        {alert.is_resolved && (
                          <Badge variant="success" size="sm">
                            RESOLVED
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(alert.created_at), 'MMM dd, yyyy HH:mm')}
                        </div>
                        <span>•</span>
                        <span className="capitalize">{alert.alert_type.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsList;