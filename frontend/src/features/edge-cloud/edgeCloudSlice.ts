import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { edgeCloudAPI } from './edgeCloudAPI';

interface EdgeCloudState {
  devices: any[];
  networkAnalysis: any | null;
  partitionResult: any | null;
  adaptiveResult: any | null;
  comparisonResult: any | null;
  statistics: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: EdgeCloudState = {
  devices: [],
  networkAnalysis: null,
  partitionResult: null,
  adaptiveResult: null,
  comparisonResult: null,
  statistics: null,
  loading: false,
  error: null,
};

// Async thunks
export const createDevice = createAsyncThunk(
  'edgeCloud/createDevice',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await edgeCloudAPI.createDevice(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create device');
    }
  }
);

export const fetchDevices = createAsyncThunk(
  'edgeCloud/fetchDevices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await edgeCloudAPI.listDevices();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch devices');
    }
  }
);

export const updateDeviceState = createAsyncThunk(
  'edgeCloud/updateDevice',
  async (deviceId: string, { rejectWithValue }) => {
    try {
      const response = await edgeCloudAPI.updateDeviceState(deviceId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update device');
    }
  }
);

export const analyzeNetwork = createAsyncThunk(
  'edgeCloud/analyzeNetwork',
  async (networkType: string, { rejectWithValue }) => {
    try {
      const response = await edgeCloudAPI.analyzeNetwork(networkType);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Analysis failed');
    }
  }
);

export const optimizePartition = createAsyncThunk(
  'edgeCloud/optimizePartition',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await edgeCloudAPI.optimizePartition(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Optimization failed');
    }
  }
);

export const adaptiveRepartition = createAsyncThunk(
  'edgeCloud/adaptiveRepartition',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await edgeCloudAPI.adaptiveRepartition(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Repartition failed');
    }
  }
);

export const comparePartitions = createAsyncThunk(
  'edgeCloud/comparePartitions',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await edgeCloudAPI.comparePartitions(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Comparison failed');
    }
  }
);

export const fetchStatistics = createAsyncThunk(
  'edgeCloud/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await edgeCloudAPI.getStatistics();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch statistics');
    }
  }
);

const edgeCloudSlice = createSlice({
  name: 'edgeCloud',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearResults: (state) => {
      state.partitionResult = null;
      state.adaptiveResult = null;
      state.comparisonResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create device
      .addCase(createDevice.pending, (state) => {
        state.loading = true;
      })
      .addCase(createDevice.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createDevice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch devices
      .addCase(fetchDevices.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.loading = false;
        state.devices = action.payload;
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update device
      .addCase(updateDeviceState.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDeviceState.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateDeviceState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Analyze network
      .addCase(analyzeNetwork.pending, (state) => {
        state.loading = true;
      })
      .addCase(analyzeNetwork.fulfilled, (state, action) => {
        state.loading = false;
        state.networkAnalysis = action.payload;
      })
      .addCase(analyzeNetwork.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Optimize partition
      .addCase(optimizePartition.pending, (state) => {
        state.loading = true;
      })
      .addCase(optimizePartition.fulfilled, (state, action) => {
        state.loading = false;
        state.partitionResult = action.payload;
      })
      .addCase(optimizePartition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Adaptive repartition
      .addCase(adaptiveRepartition.pending, (state) => {
        state.loading = true;
      })
      .addCase(adaptiveRepartition.fulfilled, (state, action) => {
        state.loading = false;
        state.adaptiveResult = action.payload;
      })
      .addCase(adaptiveRepartition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Compare partitions
      .addCase(comparePartitions.pending, (state) => {
        state.loading = true;
      })
      .addCase(comparePartitions.fulfilled, (state, action) => {
        state.loading = false;
        state.comparisonResult = action.payload;
      })
      .addCase(comparePartitions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch statistics
      .addCase(fetchStatistics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearResults } = edgeCloudSlice.actions;
export default edgeCloudSlice.reducer;