const express      = require('express');
const router       = express.Router();
const subCtrl      = require('../controllers/subscription.controller');
const auth         = require('../middlewares/auth');
const role         = require('../middlewares/role');

router.post('/webhook', subCtrl.webhook);

router.post('/checkout', auth, role('recruiter'), subCtrl.checkout);
router.get('/my',        auth, role('recruiter'), subCtrl.getMy);
router.post('/cancel',   auth, role('recruiter'), subCtrl.cancel);
router.get('/',          auth, role('admin'),      subCtrl.getAll);

module.exports = router;
