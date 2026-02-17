import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationBell: React.FC = () => {
  const [unreadCount] = useState(3); // Mock data
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/notifications')}
      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
      )}
    </button>
  );
};

export default NotificationBell;