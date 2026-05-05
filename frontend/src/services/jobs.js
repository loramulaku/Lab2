import api from './api';

export const getJobs    = (params) => api.get('/jobs', { params }).then(r => r.data);
export const getJob     = (id)     => api.get(`/jobs/${id}`).then(r => r.data);
export const createJob  = (data)   => api.post('/jobs', data).then(r => r.data);
export const updateJob  = (id, data) => api.put(`/jobs/${id}`, data).then(r => r.data);
export const setJobStatus = (id, status) => api.patch(`/jobs/${id}/status`, { status }).then(r => r.data);
