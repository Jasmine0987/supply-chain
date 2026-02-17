import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchWarehouses } from '../../store/slices/warehousesSlice';
import { Warehouse as WarehouseIcon, MapPin, TrendingUp, Package } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import { Warehouse } from '../../types';

const WarehousesList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { warehouses, loading } = useAppSelector((state) => state.warehouses);

  useEffect(() => {
    dispatch(fetchWarehouses());
  }, [dispatch]);

  const getUtilizationColor = (utilization: number) => {
    const percentage = (utilization / 100) * 100;
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 70) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  const totalCapacity = warehouses.reduce((sum, w) => sum + w.total_capacity, 0);
  const totalUtilization = warehouses.reduce((sum, w) => sum + w.current_utilization, 0);
  const utilizationRate = totalCapacity > 0 ? (totalUtilization / totalCapacity) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Warehouses</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage and monitor your warehouse operations
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Warehouses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {warehouses.length}
              </p>
            </div>
            <WarehouseIcon className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Capacity</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {totalCapacity.toLocaleString()}
              </p>
            </div>
            <Package className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Utilization</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {utilizationRate.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((warehouse: Warehouse) => {
          const utilizationPercentage = (warehouse.current_utilization / warehouse.total_capacity) * 100;

          return (
            <Card key={warehouse.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {warehouse.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {warehouse.code}
                    </p>
                  </div>
                  <Badge variant={warehouse.is_active ? 'success' : 'danger'} size="sm">
                    {warehouse.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </div>

                {/* Location */}
                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p>{warehouse.address}</p>
                    <p>
                      {warehouse.city}, {warehouse.state} {warehouse.postal_code}
                    </p>
                    <p>{warehouse.country}</p>
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Capacity Utilization</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {utilizationPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getUtilizationColor(
                        utilizationPercentage
                      )}`}
                      style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{warehouse.current_utilization.toLocaleString()} used</span>
                    <span>{warehouse.total_capacity.toLocaleString()} total</span>
                  </div>
                </div>

                {/* Type */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Type</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {warehouse.warehouse_type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default WarehousesList;