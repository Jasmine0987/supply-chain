import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, AlertCircle, Activity, Menu } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/shipments', icon: Package, label: 'Shipments' },
    { path: '/alerts', icon: AlertCircle, label: 'Alerts' },
    { path: '/iot', icon: Activity, label: 'IoT' },
    { path: '/settings', icon: Menu, label: 'More' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-30">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center flex-1 h-full space-y-1
                ${
                  active
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }
              `}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};