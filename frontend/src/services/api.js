/**
 * API Service - Axios instance configuration
 */

import axios from 'axios';

// Use relative URL for Vite proxy in development, full URL in production
const API_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
  : '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('[API] Request:', config.method?.toUpperCase(), config.url);
    console.log('[API] Request data:', config.data);
    
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('[API] Response OK:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log('[API] Response ERROR:', error.response?.status, error.config?.url);
    console.log('[API] Error data:', error.response?.data);
    
    // Only redirect to login if it's a 401 AND not the login endpoint itself
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      console.log('[API] 401 error on non-login route, clearing auth');
      // Clear auth on 401
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
