const conversationRepo = require('../repositories/mysql/conversation.repo');
const messageRepo = require('../repositories/mysql/message.repo');

// GET /api/conversations
// Get all conversations for the logged-in user
async function getConversations(req, res) {
  try {
    const conversations = await conversationRepo.findAllForUser(req.user.id);
    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
}

// GET /api/conversations/:id/messages
// Get messages for a specific conversation
async function getMessages(req, res) {
  try {
    const messages = await messageRepo.findByConversation(
      parseInt(req.params.id),
      50,
      parseInt(req.query.offset) || 0
    );
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
}

// POST /api/conversations
// Start or get existing conversation with another user
async function startConversation(req, res) {
  try {
    const { recipientId } = req.body;
    if (!recipientId) return res.status(400).json({ message: 'recipientId required' });
    if (recipientId === req.user.id) return res.status(400).json({ message: 'Cannot start conversation with yourself' });

    const conversation = await conversationRepo.findOrCreateBetweenUsers(
      req.user.id,
      parseInt(recipientId)
    );
    res.json(conversation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to start conversation' });
  }
}

module.exports = { getConversations, getMessages, startConversation };