import { create } from 'zustand';
import authService from '../services/authService';
import { tokenRef } from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await authService.login(email, password);
      tokenRef.current = token;
      set({ user, loading: false });
      return user;
    } catch (err) {
      const message = err.response?.data?.message ?? 'Login failed';
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null });
    try {
      const user = await authService.register(payload);
      set({ loading: false });
      return user;
    } catch (err) {
      const message = err.response?.data?.message ?? 'Registration failed';
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },

  fetchMe: async () => {
    set({ loading: true });
    try {
      const user = await authService.getMe();
      set({ user, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  logout: () => {
    tokenRef.current = null;
    set({ user: null, error: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
