const express = require('express');
const router = express.Router();
const themeController = require('../controllers/theme.controller');

router.get('/active', themeController.getActive);

module.exports = router;
