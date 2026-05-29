import api from './api';

const siteContentService = {
  /** Public — list all site content (served from MongoDB read projection). */
  async list() {
    const { data } = await api.get('/site-content');
    return data;
  },

  /** Public — fetch a single key. */
  async get(key) {
    const { data } = await api.get(`/site-content/${encodeURIComponent(key)}`);
    return data;
  },
};

export default siteContentService;
