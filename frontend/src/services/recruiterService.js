import api from './api';

const recruiterService = {
  getProfile: ()       => api.get('/recruiter/profile').then(r => r.data),
  setup:      (data)   => api.post('/recruiter/setup', data).then(r => r.data),

  uploadLogo: (file) => {
    const form = new FormData();
    form.append('logo', file);
    return api.post('/recruiter/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
};

export default recruiterService;
