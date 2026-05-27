import api from './api';

const notificationService = {
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data?.notifications ?? res.data ?? [];
  },

  getUnreadCount: async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      return res.data?.count ?? 0;
    } catch {
      return 0;
    }
  },

  markRead: async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      /* API not wired yet */
    }
  },

  markAllRead: async () => {
    try {
      await api.patch('/notifications/read-all');
    } catch {
      /* API not wired yet */
    }
  },
};

export default notificationService;
