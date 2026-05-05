import api from './api';

export const applyToJob       = (jobId, data)   => api.post(`/jobs/${jobId}/apply`, data).then(r => r.data);
export const getMyApplications = (params)       => api.get('/me/applications', { params }).then(r => r.data);
export const getJobApplications = (jobId, params) => api.get(`/jobs/${jobId}/applications`, { params }).then(r => r.data);
