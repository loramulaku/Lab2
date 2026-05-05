const express = require('express');
const router  = express.Router();
const appCtrl = require('../controllers/application.controller');
const bidCtrl = require('../controllers/bid.controller');
const auth    = require('../middlewares/auth');

// GET /api/me/applications
router.get('/applications', auth, appCtrl.getMine);

// GET /api/me/bids
router.get('/bids', auth, bidCtrl.getMine);

module.exports = router;
