import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Inventory } from '../../types';

interface InventoryState {
  items: Inventory[];
  loading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchInventory = createAsyncThunk(
  'inventory/fetchAll',
  async ({ warehouseId }: { warehouseId?: number } = {}) => {
    const params = warehouseId ? { warehouse_id: warehouseId } : {};
    const response = await api.get<Inventory[]>("/api/v1/inventory/", { params });
    return response.data;
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action: PayloadAction<Inventory[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch inventory';
      });
  },
});

export default inventorySlice.reducer;