import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setTheme } from '../../features/profile/profileSlice';

export const ThemeToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.profile.theme || 'system');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
    dispatch(setTheme(newTheme));
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    localStorage.setItem('theme', newTheme);
  };

  const getIcon = () => {
    if (theme === 'dark') return <Moon className="h-5 w-5" />;
    if (theme === 'light') return <Sun className="h-5 w-5" />;
    return <Sun className="h-5 w-5 opacity-50" />;
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={`Current theme: ${theme}`}
    >
      {getIcon()}
    </button>
  );
};