const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const {
  createPipeline,
  getPipelineByJob,
  addStage,
  moveCandidate,
  getStageHistory,
} = require('../controllers/pipeline.controller');

router.post('/', auth, role(['recruiter', 'admin']), createPipeline);
router.get('/job/:jobId', auth, role(['recruiter', 'admin']), getPipelineByJob);
router.post('/:pipelineId/stages', auth, role(['recruiter', 'admin']), addStage);
router.post('/move', auth, role(['recruiter', 'admin']), moveCandidate);
router.get('/history/:applicationId', auth, role(['recruiter', 'admin']), getStageHistory);

module.exports = router;