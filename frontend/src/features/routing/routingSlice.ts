import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { routingAPI } from '../../features/routing/routingAPI'; // ✅ CORRECT IMPORT

interface RouteState {
  optimizedRoute: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: RouteState = {
  optimizedRoute: null,
  loading: false,
  error: null,
};

// Optimize route thunk
export const optimizeRoute = createAsyncThunk(
  'routing/optimizeRoute',
  async (request: any, { rejectWithValue }) => {
    try {
      const response = await routingAPI.optimizeRoute(request); // ✅ CORRECT USAGE
      console.log('✅ Optimize route response:', response);
      return response.data; // ✅ Return the data from axios response
    } catch (error: any) {
      console.error('❌ Optimize route error:', error);
      const message = error.response?.data?.detail || error.message || 'Optimization failed';
      return rejectWithValue(message);
    }
  }
);

// Optimize with constraints thunk
export const optimizeWithConstraints = createAsyncThunk(
  'routing/optimizeWithConstraints',
  async (request: any, { rejectWithValue }) => {
    try {
      const response = await routingAPI.optimizeWithConstraints(request); // ✅ CORRECT USAGE
      console.log('✅ Optimize with constraints response:', response);
      return response.data; // ✅ Return the data from axios response
    } catch (error: any) {
      console.error('❌ Optimize with constraints error:', error);
      const message = error.response?.data?.detail || error.message || 'Optimization failed';
      return rejectWithValue(message);
    }
  }
);

const routingSlice = createSlice({
  name: 'routing',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRoute: (state) => {
      state.optimizedRoute = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Optimize route
    builder
      .addCase(optimizeRoute.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('🔄 Optimizing route...');
      })
      .addCase(optimizeRoute.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.optimizedRoute = action.payload;
        state.error = null;
        console.log('✅ Route optimized successfully:', action.payload);
      })
      .addCase(optimizeRoute.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Optimization failed';
        console.error('❌ Route optimization failed:', action.payload);
      });

    // Optimize with constraints
    builder
      .addCase(optimizeWithConstraints.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('🔄 Optimizing with constraints...');
      })
      .addCase(optimizeWithConstraints.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.optimizedRoute = action.payload;
        state.error = null;
        console.log('✅ Constrained optimization successful:', action.payload);
      })
      .addCase(optimizeWithConstraints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Optimization failed';
        console.error('❌ Constrained optimization failed:', action.payload);
      });
  },
});

export const { clearError, clearRoute } = routingSlice.actions;
export default routingSlice.reducer;