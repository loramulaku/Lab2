const express = require('express');
const router  = express.Router();
const invCtrl = require('../controllers/invitation.controller');
const auth    = require('../middlewares/auth');
const role    = require('../middlewares/role');

// Recruiter — search & invite (Mode B)
router.get('/freelancers/search',        auth, role('recruiter', 'admin'), invCtrl.searchFreelancers);
router.post('/invitations',              auth, role('recruiter', 'admin'), invCtrl.send);
router.get('/jobs/:jobId/invitations',   auth, role('recruiter', 'admin'), invCtrl.listByJob);
router.patch('/invitations/:id/revoke',  auth, role('recruiter', 'admin'), invCtrl.revoke);

// Freelancer (role 'candidate') — inbox & response
router.get('/me/invitations',             auth, role('candidate'), invCtrl.listMine);
router.post('/invitations/:id/confirm',   auth, role('candidate'), invCtrl.confirm);
router.post('/invitations/:id/accept',    auth, role('candidate'), invCtrl.accept);
router.post('/invitations/:id/reject',    auth, role('candidate'), invCtrl.reject);

module.exports = router;
