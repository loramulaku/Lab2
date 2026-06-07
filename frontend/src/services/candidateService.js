import api from './api';

const candidateService = {
  getProfile:       ()           => api.get('/candidate/profile').then(r => r.data),
  updateProfile:    (data)       => api.put('/candidate/profile', data).then(r => r.data),
  setFreelanceMode: (active)     => api.put('/candidate/freelance', { active }).then(r => r.data),

  applyToJob:       (jobId, data = {}) => api.post('/candidate/applications', { jobId, ...data }).then(r => r.data),
  myApplications:       (params) => api.get('/candidate/applications', { params }).then(r => r.data),
  getApplicationNotes: (applicationId) => api.get(`/candidate/applications/${applicationId}/notes`).then(r => r.data),

  uploadCv: (file) => {
    const form = new FormData();
    form.append('cv', file);
    return api.post('/candidate/cv', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);   // { path }
  },

  addSkill:         (data)       => api.post('/candidate/skills', data).then(r => r.data),
  deleteSkill:      (id)         => api.delete(`/candidate/skills/${id}`).then(r => r.data),

  addExperience:    (data)       => api.post('/candidate/experiences', data).then(r => r.data),
  updateExperience: (id, data)   => api.put(`/candidate/experiences/${id}`, data).then(r => r.data),
  deleteExperience: (id)         => api.delete(`/candidate/experiences/${id}`).then(r => r.data),

  addEducation:     (data)       => api.post('/candidate/educations', data).then(r => r.data),
  updateEducation:  (id, data)   => api.put(`/candidate/educations/${id}`, data).then(r => r.data),
  deleteEducation:  (id)         => api.delete(`/candidate/educations/${id}`).then(r => r.data),

  getSavedJobs:  ()        => api.get('/candidate/saved-jobs').then(r => r.data),
  getSavedJobIds:()        => api.get('/candidate/saved-job-ids').then(r => r.data),
  saveJob:       (jobId)   => api.post(`/candidate/saved-jobs/${jobId}`).then(r => r.data),
  unsaveJob:     (jobId)   => api.delete(`/candidate/saved-jobs/${jobId}`).then(r => r.data),

  uploadAvatar: (file) => {
    const form = new FormData();
    form.append('avatar', file);
    return api.post('/upload/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
};

export default candidateService;
