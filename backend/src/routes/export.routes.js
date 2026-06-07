const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');
const c       = require('../controllers/export.controller');

// GET /api/exports/my must be declared before /:entity/:format
// so Express doesn't treat "my" as an entity parameter.
router.get('/my',               auth, isAdmin, c.getMyExports);
router.post('/:entity/:format', auth, isAdmin, c.triggerExport);

module.exports = router;
