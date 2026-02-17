import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { anomalyAPI, AnomalyResponse, AnomalyDetectionRequest } from './anomalyAPI';

interface AnomalyState {
  currentDetection: AnomalyResponse | null;
  statistics: any | null;
  loading: boolean;
  error: string | null;
  trainingStatus: 'idle' | 'training' | 'success' | 'error';
}

const initialState: AnomalyState = {
  currentDetection: null,
  statistics: null,
  loading: false,
  error: null,
  trainingStatus: 'idle',
};

// Async thunks
export const detectAnomalies = createAsyncThunk(
  'anomaly/detect',
  async (data: AnomalyDetectionRequest, { rejectWithValue }) => {
    try {
      const response = await anomalyAPI.detectAnomalies(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Detection failed');
    }
  }
);

export const trainAnomalyModel = createAsyncThunk(
  'anomaly/train',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await anomalyAPI.trainModel(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Training failed');
    }
  }
);

export const fetchAnomalyStatistics = createAsyncThunk(
  'anomaly/statistics',
  async (days: number, { rejectWithValue }) => {
    try {
      const response = await anomalyAPI.getStatistics(days);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch statistics');
    }
  }
);

const anomalySlice = createSlice({
  name: 'anomaly',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDetection: (state) => {
      state.currentDetection = null;
    },
    resetTrainingStatus: (state) => {
      state.trainingStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Detect anomalies
      .addCase(detectAnomalies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(detectAnomalies.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDetection = action.payload;
      })
      .addCase(detectAnomalies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Train model
      .addCase(trainAnomalyModel.pending, (state) => {
        state.trainingStatus = 'training';
        state.error = null;
      })
      .addCase(trainAnomalyModel.fulfilled, (state) => {
        state.trainingStatus = 'success';
      })
      .addCase(trainAnomalyModel.rejected, (state, action) => {
        state.trainingStatus = 'error';
        state.error = action.payload as string;
      })
      // Fetch statistics
      .addCase(fetchAnomalyStatistics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAnomalyStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchAnomalyStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearDetection, resetTrainingStatus } = anomalySlice.actions;
export default anomalySlice.reducer;