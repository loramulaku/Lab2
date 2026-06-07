const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notification.controller');

router.get('/',            auth, getNotifications);
router.patch('/read-all',  auth, markAllAsRead);    // must be before /:id/read
router.patch('/:id/read',  auth, markAsRead);

module.exports = router;