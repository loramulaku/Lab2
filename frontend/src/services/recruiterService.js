import api from './api';

const jobQs = (params = {}) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  const s = new URLSearchParams(clean).toString();
  return s ? `?${s}` : '';
};

const recruiterService = {
  getProfile: ()       => api.get('/recruiter/profile').then(r => r.data),
  setup:      (data)   => api.post('/recruiter/setup', data).then(r => r.data),

  // ── Jobs (recruiter-owned) ───────────────────────────────────────────────
  listJobs:    (params)    => api.get(`/jobs${jobQs(params)}`).then(r => r.data),
  createJob:   (data)      => api.post('/jobs', data).then(r => r.data),
  updateJob:   (id, data)  => api.put(`/jobs/${id}`, data).then(r => r.data),
  setJobStatus:(id, status)=> api.patch(`/jobs/${id}/status`, { status }).then(r => r.data),
  deleteJob:   (id)        => api.delete(`/jobs/${id}`).then(r => r.data),

  // ── Applicants (Job Seekers) ─────────────────────────────────────────────
  getApplicants:     (params)          => api.get(`/recruiter/applicants${jobQs(params)}`).then(r => r.data),
  scheduleInterview: (id, interviewAt) => api.post(`/recruiter/applicants/${id}/interview`, { interviewAt }).then(r => r.data),

  uploadLogo: (file) => {
    const form = new FormData();
    form.append('logo', file);
    return api.post('/recruiter/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
};

export default recruiterService;
