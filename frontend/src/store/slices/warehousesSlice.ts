import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Warehouse } from '../../types';

interface WarehousesState {
  warehouses: Warehouse[];
  loading: boolean;
  error: string | null;
}

const initialState: WarehousesState = {
  warehouses: [],
  loading: false,
  error: null,
};

export const fetchWarehouses = createAsyncThunk('warehouses/fetchAll', async () => {
  const response = await api.get<Warehouse[]>('/api/v1/warehouses');
  return response.data;
});

const warehousesSlice = createSlice({
  name: 'warehouses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWarehouses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarehouses.fulfilled, (state, action: PayloadAction<Warehouse[]>) => {
        state.loading = false;
        state.warehouses = action.payload;
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch warehouses';
      });
  },
});

export default warehousesSlice.reducer;