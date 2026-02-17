import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

import {
  LayoutDashboard,
  Package,
  Warehouse,
  AlertTriangle,
  TrendingUp,
  LogOut,
} from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  //const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Supply Chain
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {user.full_name || 'User'}
          </p>
        </div>

        <nav className="mt-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>

          <Link
            to="/shipments"
            className="flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Package className="h-5 w-5" />
            Shipments
          </Link>

          <Link
            to="/inventory"
            className="flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Warehouse className="h-5 w-5" />
            Inventory
          </Link>

          <Link
            to="/alerts"
            className="flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <AlertTriangle className="h-5 w-5" />
            Alerts
          </Link>

          <Link
            to="/warehouses"
            className="flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <TrendingUp className="h-5 w-5" />
            Warehouses
          </Link>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 w-64 p-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20 rounded-lg"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;