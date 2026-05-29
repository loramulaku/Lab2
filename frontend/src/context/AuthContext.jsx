import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { tokenRef } from '../services/api';
import authService from '../services/authService';
import { isTokenValid, resolvePrimaryRole } from '../utils/auth';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const silentRefreshRef = useRef(null);
  const proactiveTimerRef = useRef(null);
  const silentRefreshInFlight = useRef(null);

  // Access token lives in memory only (tokenRef) — never localStorage or React state.
  const setAccessToken = useCallback((t) => {
    tokenRef.current = t ?? null;
  }, []);

  const clearSession = useCallback(() => {
    tokenRef.current = null;
    setUser(null);
    if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current);
  }, []);

  // Remove legacy persisted auth data (visible in DevTools → Application).
  useEffect(() => {
    for (const key of ['token', 'user', 'accessToken', 'role']) {
      localStorage.removeItem(key);
    }
  }, []);

  const scheduleProactiveRefresh = useCallback((accessToken) => {
    if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current);
    if (!accessToken) return;
    try {
      const { exp } = JSON.parse(atob(accessToken.split('.')[1]));
      const delay = Math.max(exp * 1000 - Date.now() - 60_000, 0);
      proactiveTimerRef.current = setTimeout(() => silentRefreshRef.current?.(), delay);
    } catch { /* malformed token — skip */ }
  }, []);

  const syncProfile = useCallback(async () => {
    if (!tokenRef.current) return;
    try {
      setUser(await authService.getMe());
    } catch { /* session may have expired */ }
  }, []);

  // Sync when the Axios interceptor silently refreshes after a 401.
  useEffect(() => {
    const onRefreshed = () => {
      scheduleProactiveRefresh(tokenRef.current);
      syncProfile();
    };
    const onExpired = () => clearSession();

    window.addEventListener('auth:tokenRefreshed', onRefreshed);
    window.addEventListener('auth:sessionExpired', onExpired);
    return () => {
      window.removeEventListener('auth:tokenRefreshed', onRefreshed);
      window.removeEventListener('auth:sessionExpired', onExpired);
    };
  }, [clearSession, scheduleProactiveRefresh, syncProfile]);

  useEffect(() => () => { if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current); }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !isTokenValid(tokenRef.current)) {
        silentRefreshRef.current?.();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const silentRefresh = useCallback(async () => {
    if (silentRefreshInFlight.current) return silentRefreshInFlight.current;

    const run = async () => {
      if (isTokenValid(tokenRef.current)) {
        scheduleProactiveRefresh(tokenRef.current);
        try { setUser(await authService.getMe()); } catch { /* profile loads from the page */ }
        return;
      }

      tokenRef.current = null;

      let accessToken;
      try {
        ({ token: accessToken } = await authService.refresh());
      } catch {
        clearSession();
        return;
      }

      setAccessToken(accessToken);
      scheduleProactiveRefresh(accessToken);
      try { setUser(await authService.getMe()); } catch { /* profile loads from the page */ }
    };

    const promise = run();
    silentRefreshInFlight.current = promise;
    try { await promise; }
    finally { silentRefreshInFlight.current = null; }
  }, [setAccessToken, scheduleProactiveRefresh, clearSession]);

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
    try { await authService.logout(); } catch { /* best-effort */ }
    clearSession();
  }, [clearSession]);

  const clearError = useCallback(() => setError(null), []);

  const primaryRole = resolvePrimaryRole(user?.roles ?? []);

  return (
    <AuthContext.Provider value={{
      user,
      primaryRole,
      isAuthenticated: !!user,
      loading,
      error,
      login,
      register,
      logout,
      silentRefresh,
      clearError,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
