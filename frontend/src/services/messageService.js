import api from './api';

const messageService = {
  getConversations: async () => {
    const res = await api.get('/messages/conversations');
    return res.data?.conversations ?? res.data ?? [];
  },

  getMessages: async (conversationId) => {
    const res = await api.get(`/messages/conversations/${conversationId}`);
    return res.data?.messages ?? res.data ?? [];
  },

  getUnreadCount: async () => {
    try {
      const res = await api.get('/messages/unread-count');
      return res.data?.count ?? 0;
    } catch {
      return 0;
    }
  },

  sendMessage: async (conversationId, message) => {
    const res = await api.post(`/messages/conversations/${conversationId}`, { message });
    return res.data;
  },
};

export default messageService;
