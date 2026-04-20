const express    = require('express');
const router     = express.Router();
const jobCtrl    = require('../controllers/job.controller');
const auth       = require('../middlewares/auth');
const role       = require('../middlewares/role');

router.get('/',           jobCtrl.getAll);
router.get('/:id',        jobCtrl.getById);
router.post('/',          auth, role('recruiter', 'admin'), jobCtrl.create);
router.put('/:id',        auth, role('recruiter', 'admin'), jobCtrl.update);
router.patch('/:id/status', auth, role('recruiter', 'admin'), jobCtrl.updateStatus);

module.exports = router;
