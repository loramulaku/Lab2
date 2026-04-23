import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { tokenRef } from '../services/api';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** Returns true if a JWT string exists and hasn't expired (10 s buffer). */
function isTokenValid(t) {
  if (!t) return false;
  try {
    const { exp } = JSON.parse(atob(t.split('.')[1]));
    return exp * 1000 > Date.now() + 10_000;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') ?? null);
  const [user, setUser]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // Keeps token in sync across React state, localStorage, and the Axios ref.
  const setAccessToken = useCallback((t) => {
    tokenRef.current = t ?? null;
    setToken(t ?? null);
    if (t) localStorage.setItem('token', t);
    else   localStorage.removeItem('token');
  }, []);

  // On first render, sync tokenRef from localStorage (state already initialised above).
  // If the stored token is expired, remove it so subsequent requests don't use it.
  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (isTokenValid(stored)) tokenRef.current = stored;
    else if (stored)          localStorage.removeItem('token');
  }, []);

  // Sync state when the Axios interceptor refreshes a token after a 401.
  useEffect(() => {
    const onRefreshed = (e) => setAccessToken(e.detail);
    const onExpired   = ()  => {
      localStorage.removeItem('token');
      tokenRef.current = null;
      setToken(null);
      setUser(null);
    };
    window.addEventListener('auth:tokenRefreshed', onRefreshed);
    window.addEventListener('auth:sessionExpired',  onExpired);
    return () => {
      window.removeEventListener('auth:tokenRefreshed', onRefreshed);
      window.removeEventListener('auth:sessionExpired',  onExpired);
    };
  }, [setAccessToken]);

  // Token watchdog — two triggers:
  //  • storage event: fires when another context (DevTools, other tab) modifies
  //    localStorage. Deleting the token triggers an immediate silent refresh.
  //  • visibilitychange: when the tab becomes visible again, re-validates the
  //    token so one that expired in the background is replaced before any request.
  const silentRefreshRef = useRef(null);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key !== 'token') return;
      if (!e.newValue || !isTokenValid(e.newValue)) silentRefreshRef.current?.();
      else setAccessToken(e.newValue);
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !isTokenValid(localStorage.getItem('token')))
        silentRefreshRef.current?.();
    };
    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [setAccessToken]);

  // Proactive refresh — fires 1 minute before the access token expires.
  const proactiveTimerRef = useRef(null);

  const scheduleProactiveRefresh = useCallback((accessToken) => {
    if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current);
    if (!accessToken) return;
    try {
      const { exp } = JSON.parse(atob(accessToken.split('.')[1]));
      const delay = Math.max(exp * 1000 - Date.now() - 60_000, 0);
      proactiveTimerRef.current = setTimeout(() => silentRefreshRef.current?.(), delay);
    } catch { /* malformed token — skip */ }
  }, []);

  useEffect(() => () => { if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current); }, []);

  // Deduplication — React StrictMode fires useEffect twice in dev, sending two
  // simultaneous /refresh requests. The first rotates the token (old DB row
  // deleted), so the second gets a 401. Sharing the in-flight promise means the
  // second call waits for the first instead of making its own network request.
  const silentRefreshInFlight = useRef(null);

  const silentRefresh = useCallback(async () => {
    if (silentRefreshInFlight.current) return silentRefreshInFlight.current;

    const run = async () => {
      // Fast path: valid token already in localStorage.
      const stored = localStorage.getItem('token');
      if (isTokenValid(stored)) {
        tokenRef.current = stored;
        setToken(stored);
        scheduleProactiveRefresh(stored);
        try { setUser(await authService.getMe()); } catch { /* profile loads from the page */ }
        return;
      }
      if (stored) localStorage.removeItem('token');

      // Slow path: use the httpOnly refresh cookie to get a new access token.
      let accessToken;
      try {
        ({ token: accessToken } = await authService.refresh());
      } catch {
        setAccessToken(null);
        setUser(null);
        if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current);
        return;
      }

      setAccessToken(accessToken);
      scheduleProactiveRefresh(accessToken);
      try { setUser(await authService.getMe()); } catch { /* profile loads from the page */ }
    };

    const promise = run();
    silentRefreshInFlight.current = promise;
    try   { await promise; }
    finally { silentRefreshInFlight.current = null; }
  }, [setAccessToken, scheduleProactiveRefresh]);

  // Keep silentRefreshRef pointing at the latest closure (used by timer + watchdog).
  useEffect(() => { silentRefreshRef.current = silentRefresh; }, [silentRefresh]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { token: accessToken, user: userData } = await authService.login(email, password);
      setAccessToken(accessToken);
      scheduleProactiveRefresh(accessToken);
      setUser(userData);
      return userData;
    } catch (err) {
      const message = err.response?.data?.message ?? 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [setAccessToken, scheduleProactiveRefresh]);

  const register = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      return await authService.register(payload);
    } catch (err) {
      const message = err.response?.data?.message ?? 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current);
    try { await authService.logout(); } catch { /* best-effort */ }
    setAccessToken(null);
    setUser(null);
  }, [setAccessToken]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{
      token, user, loading, error,
      login, register, logout, silentRefresh, clearError,
      setAccessToken, setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
