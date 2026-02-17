// frontend/src/features/auth/authAPI.ts

import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

export const login = async (email: string, password: string) => {
  const formData = new FormData();
  formData.append('username', email); // OAuth2 uses 'username' field
  formData.append('password', password);

  const response = await axios.post(`${API_URL}/auth/login`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};