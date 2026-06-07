import api from './api';

const notificationService = {
  getAll:      ()   => api.get('/notifications').then(r => r.data),
  markAsRead:  (id) => api.patch(`/notifications/${id}/read`).then(r => r.data),
  markAllRead: ()   => api.patch('/notifications/read-all').then(r => r.data),
};

export default notificationService;
