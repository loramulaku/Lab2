import api from './api';

const pipelineService = {
  createPipeline: (stages)               => api.post('/pipeline', { stages }).then(r => r.data),
  getMyPipeline:  ()                     => api.get('/pipeline/my').then(r => r.data),
  getBoard:       (search = '')          => api.get(`/pipeline/board${search ? `?search=${encodeURIComponent(search)}` : ''}`).then(r => r.data),
  getNotes:       ()                     => api.get('/pipeline/notes').then(r => r.data),
  moveCandidate:  (applicationId, toStageId, note) =>
    api.post('/pipeline/move', { applicationId, toStageId, note }).then(r => r.data),
  addNote: (applicationId, stageId, note) =>
    api.post('/pipeline/note', { applicationId, stageId, note }).then(r => r.data),
};

export default pipelineService;
