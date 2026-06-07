import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import notificationService from '../services/notificationService';

const NotificationContext = createContext(null);

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>');
  return ctx;
}

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:3001';

export function NotificationProvider({ children }) {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [lastApplicationEvent, setLastApplicationEvent] = useState(null);
  const socketRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // ── Fetch on login ────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!token) return;
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch {
      // silent — bell just shows 0 if fetch fails
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchAll();
    else        setNotifications([]);
  }, [token, fetchAll]);

  // ── Socket — real-time push ───────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on('notification:new', (n) => {
      setNotifications(prev => [n, ...prev]);
    });

    socket.on('application:new', (data) => {
      setLastApplicationEvent({ ...data, _ts: Date.now() });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  // ── Mark one as read ──────────────────────────────────────────────────────
  const markAsRead = useCallback(async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try { await notificationService.markAsRead(id); } catch { /* silent */ }
  }, []);

  // ── Mark all as read ──────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try { await notificationService.markAllRead(); } catch { /* silent */ }
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllRead, fetchAll, lastApplicationEvent }}>
      {children}
    </NotificationContext.Provider>
  );
}

export default NotificationContext;
