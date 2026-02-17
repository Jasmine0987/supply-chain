import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import shipmentsReducer from './slices/shipmentsSlice';
import dashboardReducer from './slices/dashboardSlice';
import inventoryReducer from './slices/inventorySlice';
import alertsReducer from './slices/alertsSlice';
import warehousesReducer from './slices/warehousesSlice';
import realtimeReducer from './slices/realtimeSlice';
import forecastingReducer from '../features/forecasting/forecastingSlice';
import anomalyReducer from '../features/anomaly/anomalySlice';
import routingReducer from '../features/routing/routingSlice';
import temporalGraphReducer from '../features/temporal-graph/temporalGraphSlice.ts';
import edgeCloudReducer from '../features/edge-cloud/edgeCloudSlice';
import probabilisticInventoryReducer from '../features/probabilistic-inventory/probabilisticInventorySlice';
import sensorFusionReducer from '../features/sensor-fusion/sensorFusionSlice';
import topologyGNNReducer from '../features/topology-gnn/topologyGNNSlice';
import profileReducer from '../features/profile/profileSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    shipments: shipmentsReducer,
    dashboard: dashboardReducer,
    inventory: inventoryReducer,
    alerts: alertsReducer,
    warehouses: warehousesReducer,
    realtime: realtimeReducer,
    forecasting: forecastingReducer,
    anomaly: anomalyReducer,
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