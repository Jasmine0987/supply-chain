import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { temporalGraphAPI } from './temporalGraphAPI';

interface TemporalGraphState {
  statistics: any | null;
  timeTravelResult: any | null;
  causalChain: any | null;
  shipmentJourney: any | null;
  eventPatterns: any | null;
  eventCorrelations: any | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: TemporalGraphState = {
  statistics: null,
  timeTravelResult: null,
  causalChain: null,
  shipmentJourney: null,
  eventPatterns: null,
  eventCorrelations: null,
  loading: false,
  error: null,
  initialized: false,
};

// Async thunks
export const initializeGraph = createAsyncThunk(
  'temporalGraph/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const response = await temporalGraphAPI.initialize();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Initialization failed');
    }
  }
);

export const syncFromDatabase = createAsyncThunk(
  'temporalGraph/sync',
  async (limit: number, { rejectWithValue }) => {
    try {
      const response = await temporalGraphAPI.syncFromDatabase(limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Sync failed');
    }
  }
);

export const executeTimeTravelQuery = createAsyncThunk(
  'temporalGraph/timeTravel',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await temporalGraphAPI.timeTravelQuery(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Query failed');
    }
  }
);

export const findCausalChain = createAsyncThunk(
  'temporalGraph/causalChain',
  async ({ eventId, maxDepth }: any, { rejectWithValue }) => {
    try {
      const response = await temporalGraphAPI.findCausalChain(eventId, maxDepth);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Query failed');
    }
  }
);

export const getShipmentJourney = createAsyncThunk(
  'temporalGraph/shipmentJourney',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await temporalGraphAPI.getShipmentJourney(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Query failed');
    }
  }
);

export const analyzeEventPatterns = createAsyncThunk(
  'temporalGraph/eventPatterns',
  async ({ eventType, days }: any, { rejectWithValue }) => {
    try {
      const response = await temporalGraphAPI.analyzeEventPatterns(eventType, days);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Analysis failed');
    }
  }
);

export const findEventCorrelations = createAsyncThunk(
  'temporalGraph/eventCorrelations',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await temporalGraphAPI.findEventCorrelations(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Query failed');
    }
  }
);

export const fetchStatistics = createAsyncThunk(
  'temporalGraph/statistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await temporalGraphAPI.getStatistics();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch statistics');
    }
  }
);

const temporalGraphSlice = createSlice({
  name: 'temporalGraph',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearResults: (state) => {
      state.timeTravelResult = null;
      state.causalChain = null;
      state.shipmentJourney = null;
      state.eventPatterns = null;
      state.eventCorrelations = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize
      .addCase(initializeGraph.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeGraph.fulfilled, (state) => {
        state.loading = false;
        state.initialized = true;
      })
      .addCase(initializeGraph.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Sync
      .addCase(syncFromDatabase.pending, (state) => {
        state.loading = true;
      })
      .addCase(syncFromDatabase.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(syncFromDatabase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Time travel
      .addCase(executeTimeTravelQuery.pending, (state) => {
        state.loading = true;
      })
      .addCase(executeTimeTravelQuery.fulfilled, (state, action) => {
        state.loading = false;
        state.timeTravelResult = action.payload;
      })
      .addCase(executeTimeTravelQuery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Causal chain
      .addCase(findCausalChain.pending, (state) => {
        state.loading = true;
      })
      .addCase(findCausalChain.fulfilled, (state, action) => {
        state.loading = false;
        state.causalChain = action.payload;
      })
      .addCase(findCausalChain.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Shipment journey
      .addCase(getShipmentJourney.pending, (state) => {
        state.loading = true;
      })
      .addCase(getShipmentJourney.fulfilled, (state, action) => {
        state.loading = false;
        state.shipmentJourney = action.payload;
      })
      .addCase(getShipmentJourney.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Event patterns
      .addCase(analyzeEventPatterns.pending, (state) => {
        state.loading = true;
      })
      .addCase(analyzeEventPatterns.fulfilled, (state, action) => {
        state.loading = false;
        state.eventPatterns = action.payload;
      })
      .addCase(analyzeEventPatterns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Event correlations
      .addCase(findEventCorrelations.pending, (state) => {
        state.loading = true;
      })
      .addCase(findEventCorrelations.fulfilled, (state, action) => {
        state.loading = false;
        state.eventCorrelations = action.payload;
      })
      .addCase(findEventCorrelations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Statistics
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

export const { clearError, clearResults } = temporalGraphSlice.actions;
export default temporalGraphSlice.reducer;