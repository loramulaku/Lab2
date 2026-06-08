import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import api from '../services/api';

export function useNotifications() {
  const socketRef = useSocket();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get('/notifications')
      .then(r => setNotifications(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handler = (notification) => {
      setNotifications(prev => [notification, ...prev]);
    };

    socket.on('notification:new', handler);
    return () => socket.off('notification:new', handler);
  }, [socketRef.current]); // eslint-disable-line react-hooks/exhaustive-deps

  const markAsRead = useCallback(async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch {}
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
