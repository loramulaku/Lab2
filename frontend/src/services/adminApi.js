import api from './api';

export const adminApi = {
  // ── Dashboard ───────────────────────────────────────────────────────────────
  getStats: async () => (await api.get('/admin/stats')).data,

  // ── Users ───────────────────────────────────────────────────────────────────
  getUsers:    async (params) => (await api.get('/admin/users', { params })).data,
  getUserById: async (id)     => (await api.get(`/admin/users/${id}`)).data,
  createUser:  async (data)   => (await api.post('/admin/users', data)).data,
  updateUser:  async (id, d)  => (await api.put(`/admin/users/${id}`, d)).data,
  deleteUser:  async (id)     => (await api.delete(`/admin/users/${id}`)).data,

  // ── Jobs ────────────────────────────────────────────────────────────────────
  getJobs:    async (params) => (await api.get('/admin/jobs', { params })).data,
  getJobById: async (id)     => (await api.get(`/admin/jobs/${id}`)).data,
  updateJob:  async (id, d)  => (await api.put(`/admin/jobs/${id}`, d)).data,
  deleteJob:  async (id)     => (await api.delete(`/admin/jobs/${id}`)).data,

  // ── Companies ───────────────────────────────────────────────────────────────
  getCompanies:    async (params) => (await api.get('/admin/companies', { params })).data,
  getCompanyById:  async (id)     => (await api.get(`/admin/companies/${id}`)).data,
  updateCompany:   async (id, d)  => (await api.put(`/admin/companies/${id}`, d)).data,
  deleteCompany:   async (id)     => (await api.delete(`/admin/companies/${id}`)).data,

  // ── Applications ────────────────────────────────────────────────────────────
  getApplications: async (params) => (await api.get('/admin/applications', { params })).data,

  // ── Roles ───────────────────────────────────────────────────────────────────
  getRoles: async () => (await api.get('/admin/roles')).data,

  // ── Site content (CMS) ──────────────────────────────────────────────────────
  getSiteContent:    async ()        => (await api.get('/admin/site-content')).data,
  upsertSiteContent: async (key, v)  => (await api.put(`/admin/site-content/${encodeURIComponent(key)}`, { value: v })).data,
  deleteSiteContent: async (key)     => (await api.delete(`/admin/site-content/${encodeURIComponent(key)}`)).data,
};
