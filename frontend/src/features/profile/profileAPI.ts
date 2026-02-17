import api from '../../services/api';

export const profileAPI = {
  getProfile: () => api.get('/api/v1/profile'),
  
  updateProfile: (data: any) => api.put('/api/v1/profile', data),
  
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post('/api/v1/profile/change-password', data),
  
  updatePreferences: (preferences: any) =>
    api.put('/api/v1/profile/preferences', preferences),
  
  uploadAvatar: (formData: FormData) =>
    api.post('/api/v1/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};