/**
 * Auth Store - Zustand state management for authentication
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false, // ✅ Add explicit isAuthenticated state

      // Login user
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          console.log('[Auth] Attempting login for:', email);
          console.log('[Auth] Password length:', password?.length);
          console.log('[Auth] Request payload:', JSON.stringify({ email, password }));
          
          const response = await api.post('/auth/login', { email, password });
          console.log('[Auth] Response status:', response.status);
          console.log('[Auth] Login response:', response.data);
          
          const { user, token } = response.data;
          
          if (!user || !token) {
            console.error('[Auth] Missing user or token in response');
            throw new Error('Invalid response from server');
          }
          
          console.log('[Auth] Setting state with user:', user.email);
          
          // ✅ Set ALL state including isAuthenticated
          set({ 
            user, 
            token, 
            isLoading: false,
            isAuthenticated: true  // ✅ CRITICAL
          });
          
          // Set auth header for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          console.log('[Auth] Login successful!');
          return { success: true };
        } catch (error) {
          console.error('[Auth] Login error:', error);
          console.error('[Auth] Error response:', error.response);
          console.error('[Auth] Error response data:', error.response?.data);
          console.error('[Auth] Error status:', error.response?.status);
          const message = error.response?.data?.error || error.message || 'Login failed';
          set({ error: message, isLoading: false, isAuthenticated: false });
          return { success: false, error: message };
        }
      },

      // Register user
      register: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', { email, password, name });
          const { user, token } = response.data;
          
          set({ 
            user, 
            token, 
            isLoading: false,
            isAuthenticated: true 
          });
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.error || 'Registration failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      // Logout user
      logout: () => {
        set({ user: null, token: null, error: null, isAuthenticated: false });
        delete api.defaults.headers.common['Authorization'];
      },

      // Set auth data directly (used by OAuth callback)
      setAuthData: (user, token) => {
        set({ user, token, isLoading: false, error: null, isAuthenticated: true });
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      },

      // Refresh user data
      refreshUser: async () => {
        const token = get().token;
        if (!token) return;

        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/profile');
          set({ user: response.data.user, isAuthenticated: true });
        } catch (error) {
          // Token might be expired
          if (error.response?.status === 401) {
            get().logout();
          }
        }
      },

      // Update user after payment
      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      // ✅ Persist user, token, AND isAuthenticated
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export default useAuthStore;
