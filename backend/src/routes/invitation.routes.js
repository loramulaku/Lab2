const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/invitation.controller');
const auth    = require('../middlewares/auth');
const role    = require('../middlewares/role');

// POST /api/invitations  (recruiter sends invite)
router.post('/',            auth, role('recruiter', 'admin'), ctrl.send);

// GET /api/invitations/mine  (freelancer views their invitations)
router.get('/mine',         auth, ctrl.getMine);

// PATCH /api/invitations/:id/respond  (freelancer accepts/rejects)
router.patch('/:id/respond', auth, ctrl.respond);

module.exports = router;
