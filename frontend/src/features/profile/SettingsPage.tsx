import React, { useState } from 'react';
import { User, Lock, Bell, Palette } from 'lucide-react';

import { UserProfile } from './UserProfile';
import { PasswordChange } from './PasswordChange';
import NotificationSettings  from './NotificationSettings';
import { ThemeToggle } from '../../components/common/ThemeToggle';

type Tab = 'profile' | 'password' | 'notifications' | 'appearance';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'password' as Tab, label: 'Password', icon: Lock },
    { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
    { id: 'appearance' as Tab, label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl p-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Tabs Container */}
        <div className="rounded-lg bg-white shadow-md dark:bg-gray-800">

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && <UserProfile />}
            {activeTab === 'password' && <PasswordChange />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'appearance' && <AppearanceSettings />}
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================
   Appearance Settings
========================= */

const AppearanceSettings: React.FC = () => {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          Theme Preference
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Customize how the application looks
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Dark Mode
            </h4>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Toggle between light and dark themes
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            💡 <strong>Tip:</strong> The theme will be saved and applied across all your devices
          </p>
        </div>
      </div>
    </div>
  );
};
