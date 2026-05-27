import api from './api';

const jobService = {
  getJobs: (params) => api.get('/jobs', { params }).then((r) => r.data),
  getJobById: (id) => api.get(`/jobs/${id}`).then((r) => r.data),
  getMyJobs: (params) => api.get('/jobs/my-jobs', { params }).then((r) => r.data),
  createJob: (data) => api.post('/jobs', data).then((r) => r.data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data).then((r) => r.data),
  updateJobStatus: (id, status) =>
    api.patch(`/jobs/${id}/status`, { status }).then((r) => r.data),
  deleteJob: (id) => api.delete(`/jobs/${id}`).then((r) => r.data),
};

export default jobService;
