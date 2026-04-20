import api from './api';

const candidateService = {
  getProfile:       ()           => api.get('/candidate/profile').then(r => r.data),
  updateProfile:    (data)       => api.put('/candidate/profile', data).then(r => r.data),

  addSkill:         (data)       => api.post('/candidate/skills', data).then(r => r.data),
  deleteSkill:      (id)         => api.delete(`/candidate/skills/${id}`).then(r => r.data),

  addExperience:    (data)       => api.post('/candidate/experiences', data).then(r => r.data),
  updateExperience: (id, data)   => api.put(`/candidate/experiences/${id}`, data).then(r => r.data),
  deleteExperience: (id)         => api.delete(`/candidate/experiences/${id}`).then(r => r.data),

  addEducation:     (data)       => api.post('/candidate/educations', data).then(r => r.data),
  updateEducation:  (id, data)   => api.put(`/candidate/educations/${id}`, data).then(r => r.data),
  deleteEducation:  (id)         => api.delete(`/candidate/educations/${id}`).then(r => r.data),

  uploadAvatar: (file) => {
    const form = new FormData();
    form.append('avatar', file);
    return api.post('/upload/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
};

export default candidateService;
