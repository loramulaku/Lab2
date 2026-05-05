const express = require('express');
const router  = express.Router({ mergeParams: true });
const ctrl    = require('../controllers/bid.controller');
const auth    = require('../middlewares/auth');
const role    = require('../middlewares/role');

// POST /api/jobs/:jobId/bids  (freelancer submits bid)
router.post('/',  auth, ctrl.submit);

// GET /api/jobs/:jobId/bids   (recruiter views bids)
router.get('/',   auth, role('recruiter', 'admin'), ctrl.getForJob);

module.exports = router;
