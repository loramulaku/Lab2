import api from './api';

export const themeService = {
  async getActive() {
    const { data } = await api.get('/theme/active');
    return data;
  },

  async update(id, config) {
    if (id) {
      const { data } = await api.put(`/admin/theme/${id}`, config);
      return data;
    }
    const { data } = await api.post('/admin/theme', config);
    return data;
  },

  async setActive(id) {
    const { data } = await api.post(`/admin/theme/${id}/activate`);
    return data;
  },
};
