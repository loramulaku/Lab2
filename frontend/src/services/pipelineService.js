import api from './api';

const pipelineService = {
  // stages: array of { name, hasCalendar } objects
  createPipeline: (stages) => api.post('/pipeline', { stages }).then(r => r.data),
  getMyPipeline:  ()       => api.get('/pipeline/my').then(r => r.data),
  getBoard:       (search = '') =>
    api.get(`/pipeline/board${search ? `?search=${encodeURIComponent(search)}` : ''}`).then(r => r.data),
  getNotes:       () => api.get('/pipeline/notes').then(r => r.data),
  // note is mandatory; interviewDate is optional ISO string (only for calendar-enabled stages)
  moveCandidate: (applicationId, toStageId, note, interviewDate = null) =>
    api.post('/pipeline/move', { applicationId, toStageId, note, interviewDate }).then(r => r.data),
  addNote: (applicationId, stageId, note) =>
    api.post('/pipeline/note', { applicationId, stageId, note }).then(r => r.data),
};

export default pipelineService;
