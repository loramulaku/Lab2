const express = require('express');
const router  = express.Router();
const bidCtrl = require('../controllers/bid.controller');
const auth    = require('../middlewares/auth');
const role    = require('../middlewares/role');

// Freelancer (role 'candidate') — Mode A bidding
router.post('/jobs/:jobId/bids', auth, role('candidate'), bidCtrl.submit);
router.get('/me/bids',           auth, role('candidate'), bidCtrl.listMine);
router.patch('/bids/:bidId/withdraw', auth, role('candidate'), bidCtrl.withdraw);

// Recruiter — review & decide
router.get('/jobs/:jobId/bids',  auth, role('recruiter', 'admin'), bidCtrl.listByJob);
router.post('/bids/:bidId/accept', auth, role('recruiter', 'admin'), bidCtrl.accept);
router.post('/bids/:bidId/reject', auth, role('recruiter', 'admin'), bidCtrl.reject);

module.exports = router;
