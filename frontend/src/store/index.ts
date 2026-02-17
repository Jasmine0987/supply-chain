import { configureStore } from '@reduxjs/toolkit';

import authReducer from '../store/slices/authSlice';
import dashboardReducer from '../store/slices/dashboardSlice';
import shipmentReducer from '../store/slices/shipmentsSlice';
import inventoryReducer from '../store/slices/inventorySlice';
import alertReducer from '../store/slices/alertsSlice';
import warehouseReducer from '../store/slices/warehousesSlice';
import realtimeReducer from '../store/slices/realtimeSlice';
import forecastingReducer from '../features/forecasting/forecastingSlice';
import anomalyReducer from '../features/anomaly/anomalySlice';
import routingReducer from '../features/routing/routingSlice';
import temporalGraphReducer from '../features/temporal-graph/temporalGraphSlice';
import edgeCloudReducer from '../features/edge-cloud/edgeCloudSlice';
import probabilisticInventoryReducer from '../features/probabilistic-inventory/probabilisticInventorySlice';
import sensorFusionReducer from '../features/sensor-fusion/sensorFusionSlice';
import topologyGNNReducer from '../features/topology-gnn/topologyGNNSlice';
import profileReducer from '../features/profile/profileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    shipments: shipmentReducer,
    inventory: inventoryReducer,
    alerts: alertReducer,
    warehouses: warehouseReducer,
    realtime: realtimeReducer,
    forecasting: forecastingReducer,
    anomaly: anomalyReducer,      // ADD THIS
    routing: routingReducer, 
    temporalGraph: temporalGraphReducer,
    edgeCloud: edgeCloudReducer,
    probabilisticInventory: probabilisticInventoryReducer,
    sensorFusion: sensorFusionReducer,
    topologyGNN: topologyGNNReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
