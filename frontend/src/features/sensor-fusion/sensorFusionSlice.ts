import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sensorFusionAPI } from './sensorFusionAPI';

interface SensorFusionState {
  shipmentReport: any | null;
  realtimeAnalysis: any | null;
  causalGraph: any | null;
  systemHealth: any | null;
  statistics: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: SensorFusionState = {
  shipmentReport: null,
  realtimeAnalysis: null,
  causalGraph: null,
  systemHealth: null,
  statistics: null,
  loading: false,
  error: null,
};

// Async thunks
export const initializeEngine = createAsyncThunk(
  'sensorFusion/initialize',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await sensorFusionAPI.initialize(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Initialization failed');
    }
  }
);

export const processShipment = createAsyncThunk(
  'sensorFusion/processShipment',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await sensorFusionAPI.processShipment(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Processing failed');
    }
  }
);

export const getShipmentReport = createAsyncThunk(
  'sensorFusion/getShipmentReport',
  async (shipmentId: string, { rejectWithValue }) => {
    try {
      const response = await sensorFusionAPI.getShipmentReport(shipmentId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch report');
    }
  }
);

export const analyzeRealtime = createAsyncThunk(
  'sensorFusion/analyzeRealtime',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await sensorFusionAPI.analyzeRealtime(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Analysis failed');
    }
  }
);

export const getCausalGraph = createAsyncThunk(
  'sensorFusion/getCausalGraph',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sensorFusionAPI.getCausalGraph();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch causal graph');
    }
  }
);

export const getSystemHealth = createAsyncThunk(
  'sensorFusion/getSystemHealth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sensorFusionAPI.getSystemHealth();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch health');
    }
  }
);

export const getStatistics = createAsyncThunk(
  'sensorFusion/getStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sensorFusionAPI.getStatistics();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch statistics');
    }
  }
);

const sensorFusionSlice = createSlice({
  name: 'sensorFusion',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearResults: (state) => {
      state.shipmentReport = null;
      state.realtimeAnalysis = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize
      .addCase(initializeEngine.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeEngine.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(initializeEngine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Process shipment
      .addCase(processShipment.pending, (state) => {
        state.loading = true;
      })
      .addCase(processShipment.fulfilled, (state, action) => {
        state.loading = false;
        state.shipmentReport = action.payload;
      })
      .addCase(processShipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get shipment report
      .addCase(getShipmentReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(getShipmentReport.fulfilled, (state, action) => {
        state.loading = false;
        state.shipmentReport = action.payload;
      })
      .addCase(getShipmentReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Analyze realtime
      .addCase(analyzeRealtime.pending, (state) => {
        state.loading = true;
      })
      .addCase(analyzeRealtime.fulfilled, (state, action) => {
        state.loading = false;
        state.realtimeAnalysis = action.payload;
      })
      .addCase(analyzeRealtime.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get causal graph
      .addCase(getCausalGraph.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCausalGraph.fulfilled, (state, action) => {
        state.loading = false;
        state.causalGraph = action.payload;
      })
      .addCase(getCausalGraph.rejected, (state, action) => {
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

export const { clearError, clearResults } = sensorFusionSlice.actions;
export default sensorFusionSlice.reducer;