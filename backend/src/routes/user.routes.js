const express  = require('express');
const router   = express.Router();
const userCtrl = require('../controllers/user.controller');
const auth     = require('../middlewares/auth');

router.post('/register', userCtrl.register);
router.post('/login',    userCtrl.login);
router.get('/me',        auth, userCtrl.getProfile);

module.exports = router;
