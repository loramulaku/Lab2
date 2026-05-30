const express    = require('express');
const router     = express.Router();
const planCtrl   = require('../controllers/plan.controller');
const auth       = require('../middlewares/auth');
const role       = require('../middlewares/role');

router.get('/',      auth, planCtrl.getAll);
router.post('/',     auth, role('admin'), planCtrl.create);
router.put('/:id',   auth, role('admin'), planCtrl.update);
router.delete('/:id',auth, role('admin'), planCtrl.delete);

module.exports = router;
