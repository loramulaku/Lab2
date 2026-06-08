const express      = require('express');
const router       = express.Router();
const contractCtrl = require('../controllers/contract.controller');
const auth         = require('../middlewares/auth');
const role         = require('../middlewares/role');

// Recruiter creates a contract draft.
router.post('/',        auth, role('recruiter', 'admin'), contractCtrl.create);

// Freelancer or candidate approves a pending contract.
router.post('/:id/approve', auth, role('candidate', 'recruiter', 'admin'), contractCtrl.approve);

// Read (both sides).
router.get('/',    auth, role('recruiter', 'candidate', 'admin'), contractCtrl.listMine);
router.get('/:id', auth, role('recruiter', 'candidate', 'admin'), contractCtrl.getById);

module.exports = router;
