import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Shipment } from '../../types';

interface ShipmentsState {
  shipments: Shipment[];
  currentShipment: Shipment | null;
  loading: boolean;
  error: string | null;
}

const initialState: ShipmentsState = {
  shipments: [],
  currentShipment: null,
  loading: false,
  error: null,
};

export const fetchShipments = createAsyncThunk(
  'shipments/fetchAll',
  async ({ status }: { status?: string } = {}) => {
    const params = status ? { status } : {};
    const response = await api.get<Shipment[]>('/api/v1/shipments', { params });
    return response.data;
  }
);

export const fetchShipmentById = createAsyncThunk(
  'shipments/fetchById',
  async (id: number) => {
    const response = await api.get<Shipment>(`/api/v1/shipments/${id}`);
    return response.data;
  }
);

const shipmentsSlice = createSlice({
  name: 'shipments',
  initialState,
  reducers: {
    clearCurrentShipment: (state) => {
      state.currentShipment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShipments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShipments.fulfilled, (state, action: PayloadAction<Shipment[]>) => {
        state.loading = false;
        state.shipments = action.payload;
      })
      .addCase(fetchShipments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch shipments';
      })
      .addCase(fetchShipmentById.fulfilled, (state, action: PayloadAction<Shipment>) => {
        state.currentShipment = action.payload;
      });
  },
});

export const { clearCurrentShipment } = shipmentsSlice.actions;
export default shipmentsSlice.reducer;