import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SensorReading {
  id: number;
  device_id: string;
  sensor_type: string;
  last_reading: any;
  battery_level: number | null;
  signal_strength: number | null;
  timestamp?: string;
}

interface RealtimeState {
  sensors: SensorReading[];
  isConnected: boolean;
  lastUpdate: string | null;
}

const initialState: RealtimeState = {
  sensors: [],
  isConnected: false,
  lastUpdate: null,
};

const realtimeSlice = createSlice({
  name: 'realtime',
  initialState,
  reducers: {
    updateSensorData: (state, action: PayloadAction<SensorReading[]>) => {
      state.sensors = action.payload;
      state.lastUpdate = new Date().toISOString();
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    updateSingleSensor: (state, action: PayloadAction<SensorReading>) => {
      const index = state.sensors.findIndex((s) => s.device_id === action.payload.device_id);
      if (index !== -1) {
        state.sensors[index] = action.payload;
      } else {
        state.sensors.push(action.payload);
      }
      state.lastUpdate = new Date().toISOString();
    },
  },
});

export const { updateSensorData, setConnectionStatus, updateSingleSensor } = realtimeSlice.actions;
export default realtimeSlice.reducer;