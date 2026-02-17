import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import { store } from './store';
import { registerServiceWorker } from './utils/pwa';
import './styles/globals.css';
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'


// Initialize theme
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme') || 'system';
  
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }
};

initializeTheme();

// Register service worker for PWA
if (import.meta.env.PROD) {
  registerServiceWorker();
}

// Listen for system theme changes
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
