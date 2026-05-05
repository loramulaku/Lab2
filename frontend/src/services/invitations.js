import api from './api';

export const sendInvitation     = (data)         => api.post('/invitations', data).then(r => r.data);
export const getMyInvitations   = (params)       => api.get('/invitations/mine', { params }).then(r => r.data);
export const respondToInvitation = (id, response) => api.patch(`/invitations/${id}/respond`, { response }).then(r => r.data);
