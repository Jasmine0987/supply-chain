import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { topologyGNNAPI } from './topologyGNNAPI';

interface TopologyGNNState {
  analysis: any | null;
  disruption: any | null;
  routes: any | null;
  insights: any | null;
  status: any | null;
  statistics: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: TopologyGNNState = {
  analysis: null,
  disruption: null,
  routes: null,
  insights: null,
  status: null,
  statistics: null,
  loading: false,
  error: null,
};

// Async thunks
export const initializeTopology = createAsyncThunk(
  'topologyGNN/initialize',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await topologyGNNAPI.initialize(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Initialization failed');
    }
  }
);

export const addEntity = createAsyncThunk(
  'topologyGNN/addEntity',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await topologyGNNAPI.addEntity(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to add entity');
    }
  }
);

export const addConnection = createAsyncThunk(
  'topologyGNN/addConnection',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await topologyGNNAPI.addConnection(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to add connection');
    }
  }
);

export const analyzeSupplyChain = createAsyncThunk(
  'topologyGNN/analyze',
  async (_, { rejectWithValue }) => {
    try {
      const response = await topologyGNNAPI.analyzeSupplyChain();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Analysis failed');
    }
  }
);

export const predictDisruption = createAsyncThunk(
  'topologyGNN/predictDisruption',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await topologyGNNAPI.predictDisruption(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Prediction failed');
    }
  }
);

export const findAlternativeRoutes = createAsyncThunk(
  'topologyGNN/findRoutes',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await topologyGNNAPI.findAlternativeRoutes(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Route search failed');
    }
  }
);

export const getInsights = createAsyncThunk(
  'topologyGNN/getInsights',
  async (_, { rejectWithValue }) => {
    try {
      const response = await topologyGNNAPI.getInsights();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch insights');
    }
  }
);

export const getStatus = createAsyncThunk(
  'topologyGNN/getStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await topologyGNNAPI.getStatus();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch status');
    }
  }
);

export const getStatistics = createAsyncThunk(
  'topologyGNN/getStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await topologyGNNAPI.getStatistics();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch statistics');
    }
  }
);

const topologyGNNSlice = createSlice({
  name: 'topologyGNN',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearResults: (state) => {
      state.analysis = null;
      state.disruption = null;
      state.routes = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize
      .addCase(initializeTopology.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeTopology.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(initializeTopology.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add entity
      .addCase(addEntity.pending, (state) => {
        state.loading = true;
      })
      .addCase(addEntity.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addEntity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add connection
      .addCase(addConnection.pending, (state) => {
        state.loading = true;
      })
      .addCase(addConnection.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addConnection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Analyze
      .addCase(analyzeSupplyChain.pending, (state) => {
        state.loading = true;
      })
      .addCase(analyzeSupplyChain.fulfilled, (state, action) => {
        state.loading = false;
        state.analysis = action.payload;
      })
      .addCase(analyzeSupplyChain.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Predict disruption
      .addCase(predictDisruption.pending, (state) => {
        state.loading = true;
      })
      .addCase(predictDisruption.fulfilled, (state, action) => {
        state.loading = false;
        state.disruption = action.payload;
      })
      .addCase(predictDisruption.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Find routes
      .addCase(findAlternativeRoutes.pending, (state) => {
        state.loading = true;
      })
      .addCase(findAlternativeRoutes.fulfilled, (state, action) => {
        state.loading = false;
        state.routes = action.payload;
      })
      .addCase(findAlternativeRoutes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get insights
      .addCase(getInsights.pending, (state) => {
        state.loading = true;
      })
      .addCase(getInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.insights = action.payload;
      })
      .addCase(getInsights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get status
      .addCase(getStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload;
      })
      .addCase(getStatus.rejected, (state, action) => {
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

export const { clearError, clearResults } = topologyGNNSlice.actions;
export default topologyGNNSlice.reducer;