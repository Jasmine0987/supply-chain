import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  category: string;
  quantity_available: number;
  quantity_reserved: number;
  quantity_incoming: number;
  unit_price: number;
  warehouse_id: number;
}

interface Warehouse {
  id: number;
  name: string;
}

const InventoryOverview: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* -------------------------------------------------- */
  /* Fetch Data */
  /* -------------------------------------------------- */
  useEffect(() => {
    fetchInventory();
    fetchWarehouses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [inventory, searchTerm, showLowStock, warehouseFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');

      console.log('[Inventory] Fetching inventory...');

      const response = await axios.get(
        'http://localhost:8000/api/v1/inventory/',
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      console.log('[Inventory] API response:', response.data);

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.items || response.data.data || [];

      setInventory(data);
      setFilteredInventory(data);
    } catch (err: any) {
      console.error('[Inventory] Fetch error:', err);
      setError(err.response?.data?.detail || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:8000/api/v1/warehouses',
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      setWarehouses(response.data || []);
    } catch (error) {
      console.warn('[Inventory] Warehouses not loaded (optional)');
      setWarehouses([]);
    }
  };

  /* -------------------------------------------------- */
  /* Filters */
  /* -------------------------------------------------- */
  const applyFilters = () => {
    let filtered = [...inventory];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (showLowStock) {
      filtered = filtered.filter((item) => item.quantity_available < 50);
    }

    if (warehouseFilter !== 'all') {
      filtered = filtered.filter(
        (item) => item.warehouse_id === Number(warehouseFilter)
      );
    }

    console.log('[Inventory] Filtered items:', filtered.length);
    setFilteredInventory(filtered);
  };

  /* -------------------------------------------------- */
  /* Helpers */
  /* -------------------------------------------------- */
  const getStockStatus = (quantity: number) => {
    if (quantity < 20)
      return {
        label: 'LOW STOCK',
        color:
          'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:bg-opacity-30 dark:text-red-200',
      };

    if (quantity < 50)
      return {
        label: 'REORDER SOON',
        color:
          'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:bg-opacity-30 dark:text-yellow-200',
      };

    return {
      label: 'IN STOCK',
      color:
        'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-200',
    };
  };

  const getWarehouseName = (id: number) =>
    warehouses.find((w) => w.id === id)?.name || `Warehouse ${id}`;

  /* -------------------------------------------------- */
  /* Loading / Error */
  /* -------------------------------------------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center">
        <p className="text-red-600 font-semibold mb-4">{error}</p>
        <button
          onClick={fetchInventory}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  /* -------------------------------------------------- */
  /* UI */
  /* -------------------------------------------------- */
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Inventory Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and manage your inventory levels across all warehouses
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Items" value={inventory.length} />
        <StatCard
          title="Low Stock Alert"
          value={inventory.filter((i) => i.quantity_available < 50).length}
          color="red"
        />
        <StatCard
          title="Total Value"
          value={`$${Math.round(
            inventory.reduce(
              (sum, i) => sum + i.quantity_available * i.unit_price,
              0
            )
          ).toLocaleString()}`}
          color="green"
        />
        <StatCard
          title="Incoming"
          value={inventory.reduce((s, i) => s + i.quantity_incoming, 0)}
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search SKU or product name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-3 rounded-lg border"
          />

          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="px-4 py-3 rounded-lg border"
          >
            <option value="all">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={showLowStock}
              onChange={(e) => setShowLowStock(e.target.checked)}
            />
            Show Low Stock Only
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">
        {filteredInventory.length === 0 ? (
          <div className="text-center p-12 text-gray-500">
            No inventory items found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                {[
                  'SKU',
                  'Product',
                  'Warehouse',
                  'Category',
                  'Available',
                  'Reserved',
                  'Incoming',
                  'Unit Price',
                  'Status',
                ].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-sm font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => {
                const status = getStockStatus(item.quantity_available);
                return (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3 font-mono">{item.sku}</td>
                    <td className="px-4 py-3 font-semibold">
                      {item.name}
                    </td>
                    <td className="px-4 py-3">
                      {getWarehouseName(item.warehouse_id)}
                    </td>
                    <td className="px-4 py-3">{item.category}</td>
                    <td className="px-4 py-3 text-right font-bold">
                      {item.quantity_available}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.quantity_reserved}
                    </td>
                    <td className="px-4 py-3 text-right text-blue-600">
                      {item.quantity_incoming}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ${item.unit_price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full border text-xs font-bold ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-sm text-gray-500 text-center">
        Showing {filteredInventory.length} of {inventory.length} items
      </p>
    </div>
  );
};

/* -------------------------------------------------- */
/* Small Stat Card */
const StatCard = ({
  title,
  value,
  color = 'blue',
}: {
  title: string;
  value: any;
  color?: string;
}) => (
  <div
    className={`bg-gradient-to-br from-${color}-500 to-${color}-700 p-6 rounded-xl text-white shadow`}
  >
    <p className="text-sm opacity-90">{title}</p>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

export default InventoryOverview;
