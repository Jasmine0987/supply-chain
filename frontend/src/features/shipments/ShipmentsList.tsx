import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchShipments } from '../../store/slices/shipmentsSlice';

import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import ExportMenu from '../../components/common/ExportMenu';

import { Shipment } from '../../types';

const ShipmentsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { shipments, loading } = useAppSelector((state) => state.shipments);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    dispatch(fetchShipments({ status: statusFilter || undefined }));
  }, [dispatch, statusFilter]);

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'success' | 'warning' | 'danger' | 'info' | 'default'
    > = {
      delivered: 'success',
      in_transit: 'info',
      pending: 'warning',
      exception: 'danger',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<
      string,
      'success' | 'warning' | 'danger' | 'default'
    > = {
      urgent: 'danger',
      high: 'warning',
      normal: 'default',
      low: 'success',
    };

    return (
      <Badge variant={variants[priority] || 'default'} size="sm">
        {priority.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ================= Page Header ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Shipments
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Track and manage all your shipments
          </p>
        </div>

        <ExportMenu
          data={shipments.map((s) => ({
            tracking_number: s.tracking_number,
            status: s.status,
            priority: s.priority,
            destination: s.destination_address,
            estimated_delivery: s.estimated_delivery,
          }))}
          filename="shipments"
          title="Shipments Report"
          columns={[
            { header: 'Tracking Number', dataKey: 'tracking_number' },
            { header: 'Status', dataKey: 'status' },
            { header: 'Priority', dataKey: 'priority' },
            { header: 'Destination', dataKey: 'destination' },
            { header: 'ETA', dataKey: 'estimated_delivery' },
          ]}
        />
      </div>

      {/* ================= Filters ================= */}
      <Card>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'All', value: '' },
            { label: 'In Transit', value: 'in_transit' },
            { label: 'Delivered', value: 'delivered' },
            { label: 'Pending', value: 'pending' },
            { label: 'Exception', value: 'exception' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                statusFilter === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {filter.label}
              {filter.value === '' && ` (${shipments.length})`}
            </button>
          ))}
        </div>
      </Card>

      {/* ================= Shipments Table ================= */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Tracking #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Current Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Destination
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  ETA
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {shipments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No shipments found
                  </td>
                </tr>
              ) : (
                shipments.map((shipment: Shipment) => (
                  <tr
                    key={shipment.id}
                    className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    onClick={() =>
                      navigate(`/shipments/${shipment.id}`)
                    }
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {shipment.tracking_number}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(shipment.status)}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {getPriorityBadge(shipment.priority)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="max-w-xs truncate">
                          {shipment.current_location || 'Unknown'}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="block max-w-xs truncate text-sm text-gray-900 dark:text-white">
                        {shipment.destination_address || 'N/A'}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        {shipment.estimated_delivery
                          ? format(
                              new Date(shipment.estimated_delivery),
                              'MMM dd, yyyy'
                            )
                          : 'TBD'}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/shipments/${shipment.id}`);
                        }}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ShipmentsList;
