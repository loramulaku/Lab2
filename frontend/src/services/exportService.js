import api from './api';

const exportService = {
  triggerExport: (entity, format) =>
    api.post(`/exports/${entity}/${format}`).then(r => r.data),

  getMyExports: () =>
    api.get('/exports/my').then(r => r.data),
};

export default exportService;
