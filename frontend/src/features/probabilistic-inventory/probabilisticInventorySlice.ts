import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { probabilisticInventoryAPI } from './probabilisticInventoryAPI';

interface ProbabilisticInventoryState {
  warehouses: any[];
  allocation: any | null;
  reallocation: any | null;
  strategyComparison: any | null;
  forecastDetail: any | null;
  confidenceBands: any | null;
  reallocationHistory: any[];
  systemHealth: any | null;
  statistics: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProbabilisticInventoryState = {
  warehouses: [],
  allocation: null,
  reallocation: null,
  strategyComparison: null,
  forecastDetail: null,
  confidenceBands: null,
  reallocationHistory: [],
  systemHealth: null,
  statistics: null,
  loading: false,
  error: null,
};

// Async thunks
export const registerWarehouse = createAsyncThunk(
  'probabilisticInventory/registerWarehouse',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await probabilisticInventoryAPI.registerWarehouse(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to register warehouse');
    }
  }
);

export const loadDemandHistory = createAsyncThunk(
  'probabilisticInventory/loadDemandHistory',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await probabilisticInventoryAPI.loadDemandHistory(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to load demand history');
    }
  }
);

export const generateAllocation = createAsyncThunk(
  'probabilisticInventory/generateAllocation',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await probabilisticInventoryAPI.generateAllocation(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Allocation failed');
    }
  }
);

export const getAllocationSummary = createAsyncThunk(
  'probabilisticInventory/getAllocationSummary',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await probabilisticInventoryAPI.getAllocationSummary(productId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch allocation');
    }
  }
);

export const checkReallocation = createAsyncThunk(
  'probabilisticInventory/checkReallocation',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await probabilisticInventoryAPI.checkReallocation(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Reallocation check failed');
    }
  }
);

export const compareStrategies = createAsyncThunk(
  'probabilisticInventory/compareStrategies',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await probabilisticInventoryAPI.compareStrategies(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Comparison failed');
    }
  }
);

export const getForecastDetail = createAsyncThunk(
  'probabilisticInventory/getForecastDetail',
  async ({ productId, warehouseId }: { productId: string; warehouseId: string }, { rejectWithValue }) => {
    try {
      const response = await probabilisticInventoryAPI.getForecastDetail(productId, warehouseId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch forecast');
    }
  }
);

export const getConfidenceBands = createAsyncThunk(
  'probabilisticInventory/getConfidenceBands',
  async ({ productId, warehouseId }: { productId: string; warehouseId: string }, { rejectWithValue }) => {
    try {
      const response = await probabilisticInventoryAPI.getConfidenceBands(productId, warehouseId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch confidence bands');
    }
  }
);

export const getReallocationHistory = createAsyncThunk(
  'probabilisticInventory/getReallocationHistory',
  async ({ productId, days }: { productId?: string; days?: number }, { rejectWithValue }) => {
    try {
      const response = await probabilisticInventoryAPI.getReallocationHistory(productId, days);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch history');
    }
  }
);

export const getSystemHealth = createAsyncThunk(
  'probabilisticInventory/getSystemHealth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await probabilisticInventoryAPI.getSystemHealth();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch system health');
    }
  }
);

export const getStatistics = createAsyncThunk(
  'probabilisticInventory/getStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await probabilisticInventoryAPI.getStatistics();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch statistics');
    }
  }
);

const probabilisticInventorySlice = createSlice({
  name: 'probabilisticInventory',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearResults: (state) => {
      state.allocation = null;
      state.reallocation = null;
      state.strategyComparison = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register warehouse
      .addCase(registerWarehouse.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerWarehouse.fulfilled, (state) => {
        state.loading = false;
        // Add warehouse to list if needed
      })
      .addCase(registerWarehouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Load demand history
      .addCase(loadDemandHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadDemandHistory.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(loadDemandHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Generate allocation
      .addCase(generateAllocation.pending, (state) => {
        state.loading = true;
      })
      .addCase(generateAllocation.fulfilled, (state, action) => {
        state.loading = false;
        state.allocation = action.payload;
      })
      .addCase(generateAllocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get allocation summary
      .addCase(getAllocationSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllocationSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.allocation = action.payload;
      })
      .addCase(getAllocationSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Check reallocation
      .addCase(checkReallocation.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkReallocation.fulfilled, (state, action) => {
        state.loading = false;
        state.reallocation = action.payload;
      })
      .addCase(checkReallocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Compare strategies
      .addCase(compareStrategies.pending, (state) => {
        state.loading = true;
      })
      .addCase(compareStrategies.fulfilled, (state, action) => {
        state.loading = false;
        state.strategyComparison = action.payload;
      })
      .addCase(compareStrategies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get forecast detail
      .addCase(getForecastDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(getForecastDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.forecastDetail = action.payload;
      })
      .addCase(getForecastDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get confidence bands
      .addCase(getConfidenceBands.pending, (state) => {
        state.loading = true;
      })
      .addCase(getConfidenceBands.fulfilled, (state, action) => {
        state.loading = false;
        state.confidenceBands = action.payload;
      })
      .addCase(getConfidenceBands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get reallocation history
      .addCase(getReallocationHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getReallocationHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.reallocationHistory = action.payload.history;
      })
      .addCase(getReallocationHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get system health
      .addCase(getSystemHealth.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSystemHealth.fulfilled, (state, action) => {
        state.loading = false;
        state.systemHealth = action.payload;
      })
      .addCase(getSystemHealth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get statistics
      .addCase(getStatistics.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(getStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearResults } = probabilisticInventorySlice.actions;
export default probabilisticInventorySlice.reducer;