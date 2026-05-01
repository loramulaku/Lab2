const express      = require('express');
const router       = express.Router();
const planCtrl     = require('../controllers/plan.controller');

router.get('/', planCtrl.getAll);

module.exports = router;
