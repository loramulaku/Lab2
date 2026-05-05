import api from './api';

export const submitBid  = (jobId, data)    => api.post(`/jobs/${jobId}/bids`, data).then(r => r.data);
export const getJobBids = (jobId, params)  => api.get(`/jobs/${jobId}/bids`, { params }).then(r => r.data);
export const getMyBids  = (params)         => api.get('/me/bids', { params }).then(r => r.data);
