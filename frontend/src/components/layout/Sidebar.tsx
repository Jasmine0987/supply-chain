import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  TruckIcon,
  Bell,
  MapPin,
  TrendingUp,
  Activity,
  Radio,
  Users,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = React.useState<string[]>([
    'Operations',
    'AI & Analytics',
  ]);

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  // Navigation structure organized by category
  const navGroups: NavGroup[] = [
    {
      title: 'Main',
      items: [
        {
          name: 'Dashboard',
          path: '/',
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
      ],
    },
    {
      title: 'Operations',
      items: [
        {
          name: 'Shipments',
          path: '/shipments',
          icon: <Package className="h-5 w-5" />,
        },
        {
          name: 'Inventory',
          path: '/inventory',
          icon: <Warehouse className="h-5 w-5" />,
        },
        {
          name: 'Warehouses',
          path: '/warehouses',
          icon: <Warehouse className="h-5 w-5" />,
        },
        {
          name: 'Carriers',
          path: '/carriers',
          icon: <TruckIcon className="h-5 w-5" />,
        },
      ],
    },
    {
      title: 'AI & Analytics',
      items: [
        {
          name: 'Route Optimization',
          path: '/route-optimization',
          icon: <MapPin className="h-5 w-5" />,
          badge: 'AI',
          badgeColor: 'bg-blue-500',
        },
        {
          name: 'Demand Forecasting',
          path: '/forecasting',
          icon: <TrendingUp className="h-5 w-5" />,
          badge: 'AI',
          badgeColor: 'bg-purple-500',
        },
        {
          name: 'Anomaly Detection',
          path: '/anomaly-detection',
          icon: <Activity className="h-5 w-5" />,
          badge: 'ML',
          badgeColor: 'bg-green-500',
        },
        {
          name: 'Analytics',
          path: '/analytics',
          icon: <BarChart3 className="h-5 w-5" />,
        },
      ],
    },
    {
      title: 'Monitoring',
      items: [
        {
          name: 'IoT Sensors',
          path: '/iot-sensors',
          icon: <Radio className="h-5 w-5" />,
          badge: 'Live',
          badgeColor: 'bg-red-500 animate-pulse',
        },
        {
          name: 'Alerts',
          path: '/alerts',
          icon: <Bell className="h-5 w-5" />,
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          name: 'Users',
          path: '/users',
          icon: <Users className="h-5 w-5" />,
        },
        {
          name: 'Settings',
          path: '/settings',
          icon: <Settings className="h-5 w-5" />,
        },
      ],
    },
  ];

  return (
    <div className="h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 px-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          🚚 Supply Chain
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-2">
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(group.title)}
              className="w-full flex items-center justify-between px-6 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <span>{group.title}</span>
              {expandedGroups.includes(group.title) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {/* Group Items */}
            {expandedGroups.includes(group.title) && (
              <div className="space-y-1 px-3 mt-1">
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200
                      ${
                        isActive(item.path)
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <span className="text-sm">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`
                          px-2 py-0.5 text-xs font-semibold text-white rounded-full
                          ${item.badgeColor}
                        `}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              Admin User
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              admin@supplychain.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};