import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

interface DashboardStats {
  totalShipments: number;
  inTransit: number;
  delivered: number;
  alerts: number;
  onTimeDeliveryRate: number;
}

interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  loading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async () => {
    // For now, we'll calculate from shipments endpoint
    // In production, you'd have a dedicated stats endpoint
    const [shipments, alerts] = await Promise.all([
      api.get('/api/v1/shipments'),
      api.get('/api/v1/alerts', { params: { is_resolved: false } }),
    ]);

    const total = shipments.data.length;
    const inTransit = shipments.data.filter((s: any) => s.status === 'in_transit').length;
    const delivered = shipments.data.filter((s: any) => s.status === 'delivered').length;

    return {
      totalShipments: total,
      inTransit,
      delivered,
      alerts: alerts.data.length,
      onTimeDeliveryRate: total > 0 ? (delivered / total) * 100 : 0,
    };
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<DashboardStats>) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch stats';
      });
  },
});

export default dashboardSlice.reducer;