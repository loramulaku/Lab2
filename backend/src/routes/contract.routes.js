const express      = require('express');
const router       = express.Router();
const contractCtrl = require('../controllers/contract.controller');
const auth         = require('../middlewares/auth');
const role         = require('../middlewares/role');

router.get('/',    auth, role('recruiter', 'candidate', 'admin'), contractCtrl.listMine);
router.get('/:id', auth, role('recruiter', 'candidate', 'admin'), contractCtrl.getById);

module.exports = router;
