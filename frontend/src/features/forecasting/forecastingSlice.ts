import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { forecastingAPI, ForecastResponse, Anomaly } from './forecastingAPI';

interface ForecastingState {
  currentForecast: ForecastResponse | null;
  forecasts: any[];
  anomalies: Anomaly[];
  modelComparison: any | null;
  loading: boolean;
  error: string | null;
  trainingStatus: 'idle' | 'training' | 'success' | 'error';
}

const initialState: ForecastingState = {
  currentForecast: null,
  forecasts: [],
  anomalies: [],
  modelComparison: null,
  loading: false,
  error: null,
  trainingStatus: 'idle',
};

// Async thunks
export const trainModel = createAsyncThunk(
  'forecasting/trainModel',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await forecastingAPI.trainModel(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Training failed');
    }
  }
);

export const generateForecast = createAsyncThunk(
  'forecasting/generateForecast',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await forecastingAPI.generateForecast(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Forecast generation failed');
    }
  }
);

export const fetchForecasts = createAsyncThunk(
  'forecasting/fetchForecasts',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await forecastingAPI.getForecasts(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch forecasts');
    }
  }
);

export const detectAnomalies = createAsyncThunk(
  'forecasting/detectAnomalies',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await forecastingAPI.detectAnomalies(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Anomaly detection failed');
    }
  }
);

export const compareModels = createAsyncThunk(
  'forecasting/compareModels',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await forecastingAPI.compareModels(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Model comparison failed');
    }
  }
);

const forecastingSlice = createSlice({
  name: 'forecasting',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentForecast: (state) => {
      state.currentForecast = null;
    },
    resetTrainingStatus: (state) => {
      state.trainingStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Train model
      .addCase(trainModel.pending, (state) => {
        state.trainingStatus = 'training';
        state.error = null;
      })
      .addCase(trainModel.fulfilled, (state) => {
        state.trainingStatus = 'success';
      })
      .addCase(trainModel.rejected, (state, action) => {
        state.trainingStatus = 'error';
        state.error = action.payload as string;
      })
      // Generate forecast
      .addCase(generateForecast.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateForecast.fulfilled, (state, action) => {
        state.loading = false;
        state.currentForecast = action.payload;
      })
      .addCase(generateForecast.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch forecasts
      .addCase(fetchForecasts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchForecasts.fulfilled, (state, action) => {
        state.loading = false;
        state.forecasts = action.payload;
      })
      .addCase(fetchForecasts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Detect anomalies
      .addCase(detectAnomalies.pending, (state) => {
        state.loading = true;
      })
      .addCase(detectAnomalies.fulfilled, (state, action) => {
        state.loading = false;
        state.anomalies = action.payload.anomalies;
      })
      .addCase(detectAnomalies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Compare models
      .addCase(compareModels.pending, (state) => {
        state.loading = true;
      })
      .addCase(compareModels.fulfilled, (state, action) => {
        state.loading = false;
        state.modelComparison = action.payload;
      })
      .addCase(compareModels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentForecast, resetTrainingStatus } = forecastingSlice.actions;
export default forecastingSlice.reducer;