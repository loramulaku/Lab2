import api from './api';

/**
 * Freelance hiring flow (Modes A/B/C) — bids, invitations, contracts, search.
 * Uses the shared `api` instance so the access token + silent-refresh
 * interceptors apply automatically.
 *
 * Backend route map (see backend/src/routes/bid|invitation|contract.routes.js):
 *   Bids        : POST /jobs/:jobId/bids · GET /me/bids · PATCH /bids/:id/withdraw
 *                 GET /jobs/:jobId/bids · POST /bids/:id/accept · POST /bids/:id/reject
 *   Invitations : GET /freelancers/search · POST /invitations · GET /jobs/:jobId/invitations
 *                 PATCH /invitations/:id/revoke · GET /me/invitations
 *                 POST /invitations/:id/accept · POST /invitations/:id/reject
 *   Contracts   : GET /contracts · GET /contracts/:id
 *   Jobs (read) : GET /jobs?employmentType=freelance&status=open
 */
const qs = (params = {}) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  const s = new URLSearchParams(clean).toString();
  return s ? `?${s}` : '';
};

const freelanceService = {
  // ── Public job board (read) ──────────────────────────────────────────────
  listJobs:        (params)        => api.get(`/jobs${qs(params)}`).then(r => r.data),
  getJob:          (jobId)         => api.get(`/jobs/${jobId}`).then(r => r.data),

  // ── Candidate / freelancer side ──────────────────────────────────────────
  submitBid:       (jobId, data)   => api.post(`/jobs/${jobId}/bids`, data).then(r => r.data),
  myBids:          (params)        => api.get(`/me/bids${qs(params)}`).then(r => r.data),
  withdrawBid:     (bidId)         => api.patch(`/bids/${bidId}/withdraw`).then(r => r.data),
  myInvitations:   (params)        => api.get(`/me/invitations${qs(params)}`).then(r => r.data),
  confirmInvitation:(id)           => api.post(`/invitations/${id}/confirm`).then(r => r.data),
  acceptInvitation:(id)            => api.post(`/invitations/${id}/accept`).then(r => r.data),
  rejectInvitation:(id)            => api.post(`/invitations/${id}/reject`).then(r => r.data),

  // ── Recruiter side ───────────────────────────────────────────────────────
  searchFreelancers:(params)       => api.get(`/freelancers/search${qs(params)}`).then(r => r.data),
  sendInvitation:  (data)          => api.post('/invitations', data).then(r => r.data),
  bidsByJob:       (jobId, params) => api.get(`/jobs/${jobId}/bids${qs(params)}`).then(r => r.data),
  acceptBid:       (bidId)         => api.post(`/bids/${bidId}/accept`).then(r => r.data),
  rejectBid:       (bidId)         => api.post(`/bids/${bidId}/reject`).then(r => r.data),
  invitationsByJob:(jobId, params) => api.get(`/jobs/${jobId}/invitations${qs(params)}`).then(r => r.data),
  revokeInvitation:(id)            => api.patch(`/invitations/${id}/revoke`).then(r => r.data),

  // ── Contracts (both sides) ───────────────────────────────────────────────
  myContracts:     (params)        => api.get(`/contracts${qs(params)}`).then(r => r.data),
  getContract:     (id)            => api.get(`/contracts/${id}`).then(r => r.data),
  createContract:  (data)          => api.post('/contracts', data).then(r => r.data),
  approveContract: (id)            => api.post(`/contracts/${id}/approve`).then(r => r.data),
  hiredRecords:    (params)        => api.get(`/contracts${qs({ ...params, status: 'active' })}`).then(r => r.data),
};

export default freelanceService;
