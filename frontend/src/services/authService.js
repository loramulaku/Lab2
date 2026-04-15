import api from './api';

const authService = {
  async login(email, password) {
    const { data } = await api.post('/users/login', { email, password });
    return data; // { token, user }
  },

  async register(payload) {
    const { data } = await api.post('/users/register', payload);
    return data; // UserDTO
  },

  async getMe() {
    const { data } = await api.get('/users/me');
    return data;
  },
};

export default authService;
