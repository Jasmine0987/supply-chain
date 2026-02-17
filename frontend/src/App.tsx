import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import EdgeCloudDashboard from './features/edge-cloud/EdgeCloudDashboard';
import Login from './features/auth/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardOverview from './features/dashboard/DashboardOverview';
import ShipmentsList from './features/shipments/ShipmentsList';
import ShipmentDetail from './features/shipments/ShipmentDetail';
import InventoryList from './features/inventory/InventoryList';
import AlertCenter from './features/alerts/AlertCenter';
import WarehousesList from './features/warehouses/WarehousesList';
import IoTDashboard from './features/iot/IoTDashboard_FIXED';
import AnalyticsDashboard from './features/analytics/AnalyticsDashboard';
import ProbabilisticInventoryDashboard from './features/probabilistic-inventory/ProbabilisticDashboard';
import SensorFusionDashboard from './features/sensor-fusion/SensorFusionDashboard';
import TopologyGNNDashboard from './features/topology-gnn/TopologyGNNDashboard';
import { SettingsPage } from './features/profile/SettingsPage';
import { ForecastingDashboard } from './features/forecasting/ForecastingDashboard';
import { AnomalyDashboard } from './features/anomaly/AnomalyDashboard';
import { RoutingDashboard } from './features/routing/RoutingDashboard';
import { TemporalGraphDashboard } from './features/temporal-graph/TemporalGraphDashboard';
import { websocketService } from './services/websocket';

/* ------------------------------------------------------------------ */
/* Route Guards */
/* ------------------------------------------------------------------ */

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (token && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

/* ------------------------------------------------------------------ */
/* App */
/* ------------------------------------------------------------------ */

function App() {
  // 🔌 Initialize WebSocket ONCE for the entire app
  useEffect(() => {
    websocketService.connect();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="shipments" element={<ShipmentsList />} />
          <Route path="shipments/:id" element={<ShipmentDetail />} />
          <Route path="inventory" element={<InventoryList />} />
          <Route path="warehouses" element={<WarehousesList />} />
          <Route path="alerts" element={<AlertCenter />} />
          <Route path="iot" element={<IoTDashboard />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="forecasting" element={<ForecastingDashboard />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="anomaly-detection" element={<AnomalyDashboard />} />
          <Route path="route-optimization" element={<RoutingDashboard />} />
          <Route path="temporal-graph" element={<TemporalGraphDashboard />} />
          <Route path="edge-cloud" element={<EdgeCloudDashboard />} />
          <Route
            path="probabilistic-inventory"
            element={<ProbabilisticInventoryDashboard />}
          />
          <Route path="sensor-fusion" element={<SensorFusionDashboard />} />
          <Route path="topology-gnn" element={<TopologyGNNDashboard />} />
          <Route
            path="carriers"
            element={<div className="text-white">Carriers Page (Coming Soon)</div>}
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
