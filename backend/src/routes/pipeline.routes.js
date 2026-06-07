const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/auth');
const role    = require('../middlewares/role');
const c       = require('../controllers/pipeline.controller');

const recruiter = [auth, role('recruiter', 'admin')];

// Pipeline management
router.post('/',      ...recruiter, c.createPipeline);
router.put('/',       ...recruiter, c.editPipeline);   // destructive edit — resets all candidate stages
router.get('/my',     ...recruiter, c.getMyPipeline);
router.get('/board',  ...recruiter, c.getPipelineBoard);
router.get('/notes',  ...recruiter, c.getTransitionNotes);
router.post('/move',  ...recruiter, c.moveCandidate);
router.post('/note',  ...recruiter, c.addNote);

// Legacy (kept for any old callers)
router.get('/job/:jobId',              ...recruiter, c.getPipelineByJob);
router.post('/:pipelineId/stages',     ...recruiter, c.addStage);
router.get('/history/:applicationId',  ...recruiter, c.getStageHistory);

module.exports = router;
