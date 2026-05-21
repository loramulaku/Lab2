import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send httpOnly refresh cookie on every request
});

// ── Token ref ─────────────────────────────────────────────────────────────────
// AuthContext sets this ref so interceptors can read the latest access token
// without causing stale closures or circular import issues.
export const tokenRef = { current: null };

// ── Request interceptor — attach access token ─────────────────────────────────
api.interceptors.request.use(config => {
  const t = tokenRef.current;
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// ── Response interceptor — silent refresh on 401 ─────────────────────────────
let refreshPromise = null; // deduplicate concurrent refresh attempts

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;

    // Only attempt refresh on 401, only once per request, and never for the
    // refresh endpoint itself (prevents infinite loop if refresh token is bad).
    const isRefreshEndpoint = original.url?.includes('/users/refresh');
    if (err.response?.status === 401 && !original._retry && !isRefreshEndpoint) {
      original._retry = true;

      try {
        // Deduplicate: if a refresh is already in flight, wait for it
        if (!refreshPromise) {
          refreshPromise = axios.post(
            `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api'}/users/refresh`,
            {},
            { withCredentials: true }
          ).finally(() => { refreshPromise = null; });
        }

        const { data } = await refreshPromise;
        tokenRef.current = data.token;

        // Notify AuthContext of the new token via a custom event
        window.dispatchEvent(new CustomEvent('auth:tokenRefreshed', { detail: data.token }));

        // Retry original request with the new token
        original.headers.Authorization = `Bearer ${data.token}`;
        return api(original);
      } catch {
        // Refresh failed — session is over
        tokenRef.current = null;
        window.dispatchEvent(new CustomEvent('auth:sessionExpired'));
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
