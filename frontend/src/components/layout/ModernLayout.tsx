// frontend/src/components/layout/ModernLayout.tsx

import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const ModernLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Shipments', path: '/shipments', icon: '📦' },
    { name: 'Inventory', path: '/inventory', icon: '📋' },
    { name: 'Warehouses', path: '/warehouses', icon: '🏢' },
    { name: 'Alerts', path: '/alerts', icon: '🔔' },
    { name: 'IoT Sensors', path: '/iot', icon: '📡' },
    { 
      name: 'AI Features', 
      icon: '🤖',
      submenu: [
        { name: 'Sensor Fusion', path: '/sensor-fusion', icon: '🔬' },
        { name: 'Edge-Cloud ML', path: '/edge-cloud', icon: '☁️' },
        { name: 'Probabilistic Inventory', path: '/probabilistic-inventory', icon: '📊' },
        { name: 'Topology GNN', path: '/topology-gnn', icon: '🕸️' },
      ]
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Top Header */}
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-50 backdrop-blur-lg bg-opacity-90">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                S
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SupplyChain AI
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Intelligent Logistics</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-64 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full pulse"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-300 dark:border-slate-600">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">Admin User</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">admin@supply.com</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-slate-800 shadow-xl transition-all duration-300 min-h-screen`}>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <div key={item.name}>
                {item.submenu ? (
                  <details className="group">
                    <summary className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all">
                      <span className="text-2xl">{item.icon}</span>
                      {sidebarOpen && (
                        <>
                          <span className="font-semibold flex-1">{item.name}</span>
                          <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </summary>
                    {sidebarOpen && (
                      <div className="ml-8 mt-2 space-y-1">
                        {item.submenu.map((sub) => (
                          <button
                            key={sub.path}
                            onClick={() => navigate(sub.path)}
                            className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-left transition-all ${
                              isActive(sub.path)
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            <span>{sub.icon}</span>
                            <span className="text-sm font-medium">{sub.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </details>
                ) : (
                  <button
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-slate-700 dark:hover:to-slate-600'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    {sidebarOpen && <span className="font-semibold">{item.name}</span>}
                  </button>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ModernLayout;