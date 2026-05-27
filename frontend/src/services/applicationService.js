import api from './api';

const applicationService = {
  getMyApplications: () =>
    api.get('/application/my-applications').then((r) => r.data),

  getApplicationsByJob: (jobId) =>
    api.get(`/application/job/${jobId}`).then((r) => r.data),

  updateStatus: (id, status) =>
    api.put(`/application/${id}/status`, { status }).then((r) => r.data),

  submitApplication: ({ jobId, coverLetter, resumeFile }) => {
    if (resumeFile) {
      const form = new FormData();
      form.append('jobId', jobId);
      form.append('coverLetter', coverLetter);
      form.append('resume', resumeFile);
      return api
        .post('/application', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data);
    }

    return api
      .post('/application', { jobId, coverLetter })
      .then((r) => r.data);
  },
};

export default applicationService;
