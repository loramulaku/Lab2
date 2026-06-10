import api from './api';

// All admin calls go through the shared api instance (auto token-refresh, Vite proxy)
export const adminApi = {
  getStats:    ()       => api.get('/admin/stats').then(r => r.data),
  getRoles:    ()       => api.get('/admin/roles').then(r => r.data),

  getUsers:    (params) => api.get('/admin/users',    { params }).then(r => r.data),
  getUserById: (id)     => api.get(`/admin/users/${id}`).then(r => r.data),
  createUser:  (data)   => api.post('/admin/users', data).then(r => r.data),
  updateUser:  (id, d)  => api.put(`/admin/users/${id}`, d).then(r => r.data),
  deleteUser:  (id)     => api.delete(`/admin/users/${id}`).then(r => r.data),

  getJobs:     (params) => api.get('/admin/jobs',     { params }).then(r => r.data),
  getJobById:  (id)     => api.get(`/admin/jobs/${id}`).then(r => r.data),
  updateJob:   (id, d)  => api.put(`/admin/jobs/${id}`, d).then(r => r.data),
  deleteJob:   (id)     => api.delete(`/admin/jobs/${id}`).then(r => r.data),

  getCompanies:    (p)  => api.get('/admin/companies',     { params: p }).then(r => r.data),
  getCompanyById:  (id) => api.get(`/admin/companies/${id}`).then(r => r.data),
  updateCompany:   (id, d) => api.put(`/admin/companies/${id}`, d).then(r => r.data),
  deleteCompany:   (id) => api.delete(`/admin/companies/${id}`).then(r => r.data),

  getApplications: (p)  => api.get('/admin/applications', { params: p }).then(r => r.data),

  getPlans:    ()       => api.get('/plans').then(r => r.data),
  createPlan:  (data)   => api.post('/plans', data).then(r => r.data),
  updatePlan:  (id, d)  => api.put(`/plans/${id}`, d).then(r => r.data),
  deletePlan:  (id)     => api.delete(`/plans/${id}`).then(r => r.data),

  getCandidates:    (params) => api.get('/admin/candidates', { params }).then(r => r.data),

  // ── Categories (admin CRUD) ────────────────────────────────────────────────
  getCategories:    ()      => api.get('/admin/categories').then(r => r.data),
  createCategory:   (data)  => api.post('/admin/categories', data).then(r => r.data),
  updateCategory:   (id, d) => api.put(`/admin/categories/${id}`, d).then(r => r.data),
  deleteCategory:   (id)    => api.delete(`/admin/categories/${id}`).then(r => r.data),
};
