const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { getConversations, getMessages, startConversation } = require('../controllers/conversation.controller');

router.get('/', auth, getConversations);
router.get('/:id/messages', auth, getMessages);
router.post('/', auth, startConversation);

module.exports = router;
