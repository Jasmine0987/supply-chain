import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

interface Alert {
  id: number;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  alert_type: string;
  resolved: boolean;
  created_at: string;
  resolved_at?: string;
}

interface AlertState {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
}

const initialState: AlertState = {
  alerts: [],
  loading: false,
  error: null,
};

// Fetch all alerts
export const fetchAlerts = createAsyncThunk(
  'alerts/fetchAll',
  async () => {
    const response = await api.get<Alert[]>('/api/v1/alerts/');
    return response.data;
  }
);

// Resolve an alert
export const resolveAlert = createAsyncThunk(
  'alerts/resolve',
  async (alertId: number) => {
    const response = await api.patch(`/api/v1/alerts/${alertId}/resolve`);
    return response.data;
  }
);

const alertSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch alerts
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action: PayloadAction<Alert[]>) => {
        state.loading = false;
        state.alerts = action.payload;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch alerts';
      })
      // Resolve alert
      .addCase(resolveAlert.fulfilled, (state, action: PayloadAction<Alert>) => {
        const index = state.alerts.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.alerts[index] = action.payload;
        }
      });
  },
});

export default alertSlice.reducer;