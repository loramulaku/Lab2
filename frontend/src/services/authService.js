import axios from 'axios';
import { tokenRef } from './api';

// Dedicated axios instance for auth-only calls (login, refresh, logout, me).
// Has NO response interceptors so a 401 on /refresh never triggers a retry loop.
const authAxios = axios.create({
  baseURL:         import.meta.env.VITE_API_BASE_URL ?? '/api',
  withCredentials: true,
  headers:         { 'Content-Type': 'application/json' },
});

// Attach the in-memory access token to every authAxios request (needed for /users/me).
authAxios.interceptors.request.use(config => {
  const t = tokenRef.current;
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

const authService = {
  async login(email, password) {
    const { data } = await authAxios.post('/users/login', { email, password });
    return data;
  },

  async register(payload) {
    const { data } = await authAxios.post('/users/register', payload);
    return data;
  },

  async refresh() {
    const { data } = await authAxios.post('/users/refresh');
    return data;
  },

  async logout() {
    try { await authAxios.post('/users/logout'); } catch { /* best-effort */ }
  },

  async getMe() {
    const { data } = await authAxios.get('/users/me');
    return data;
  },
};

export default authService;
