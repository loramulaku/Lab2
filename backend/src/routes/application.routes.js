const express = require('express');
const router  = express.Router({ mergeParams: true });
const ctrl    = require('../controllers/application.controller');
const auth    = require('../middlewares/auth');
const role    = require('../middlewares/role');

// POST /api/jobs/:jobId/apply
router.post('/',    auth, ctrl.apply);

// GET /api/jobs/:jobId/applications  (recruiter)
router.get('/',     auth, role('recruiter', 'admin'), ctrl.getForJob);

module.exports = router;
