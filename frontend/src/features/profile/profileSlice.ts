import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { profileAPI } from './profileAPI';

interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  phone?: string;
  department?: string;
}

interface NotificationPreferences {
  email_alerts: boolean;
  email_reports: boolean;
  email_updates: boolean;
  browser_notifications: boolean;
  alert_sound: boolean;
  critical_only: boolean;
}

interface ProfileState {
  profile: UserProfile | null;
  preferences: NotificationPreferences;
  theme: 'light' | 'dark' | 'system';
  loading: boolean;
  error: string | null;
  updateSuccess: boolean;
}

const initialState: ProfileState = {
  profile: null,
  preferences: {
    email_alerts: true,
    email_reports: true,
    email_updates: false,
    browser_notifications: true,
    alert_sound: false,
    critical_only: false,
  },
  theme: (localStorage.getItem('theme') as any) || 'system',
  loading: false,
  error: null,
  updateSuccess: false,
};

// Async thunks
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileAPI.getProfile();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (data: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      const response = await profileAPI.updateProfile(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update profile');
    }
  }
);

export const changePassword = createAsyncThunk(
  'profile/changePassword',
  async (data: { current_password: string; new_password: string }, { rejectWithValue }) => {
    try {
      const response = await profileAPI.changePassword(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to change password');
    }
  }
);

export const updateNotificationPreferences = createAsyncThunk(
  'profile/updatePreferences',
  async (preferences: Partial<NotificationPreferences>, { rejectWithValue }) => {
    try {
      const response = await profileAPI.updatePreferences(preferences);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update preferences');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    updatePreferencesLocal: (state, action: PayloadAction<Partial<NotificationPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.user;
        state.preferences = action.payload.preferences || state.preferences;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Change password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.updateSuccess = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update preferences
      .addCase(updateNotificationPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNotificationPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateNotificationPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setTheme, clearUpdateSuccess, updatePreferencesLocal } = profileSlice.actions;
export default profileSlice.reducer;