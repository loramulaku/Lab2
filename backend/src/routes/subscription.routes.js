const express         = require('express');
const router          = express.Router();
const subscriptionCtrl = require('../controllers/subscription.controller');
const auth            = require('../middlewares/auth');
const role            = require('../middlewares/role');

// POST /api/subscriptions — recruiter subscribes their company to a plan
router.post('/', auth, role('recruiter', 'admin'), subscriptionCtrl.subscribe);

// GET /api/subscriptions/status — current subscription status for the recruiter's company
router.get('/status', auth, role('recruiter', 'admin'), subscriptionCtrl.getStatus);

module.exports = router;
