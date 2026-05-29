/**
 * Public site-content routes.
 * Reads only — served from MongoDB read projection.
 */
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/siteContent.controller');

router.get('/',     ctrl.getAllPublic);
router.get('/:key', ctrl.getOnePublic);

module.exports = router;
