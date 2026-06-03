const Message = require('../../models/sql/Message');
const createMysqlRepo = require('./_factory');

const base = createMysqlRepo(Message);

module.exports = {
  ...base,

  // Save a new message
  async createMessage({ conversationId, senderId, message }) {
    return Message.create({
      conversationId,
      senderId,
      message,
      isRead: false,
      createdAt: new Date()
    });
  },

  // Get messages for a conversation, oldest first, with pagination
  async findByConversation(conversationId, limit = 50, offset = 0) {
    return Message.findAll({
      where: { conversationId },
      order: [['created_at', 'ASC']],
      limit,
      offset
    });
  },

  // Mark all messages in a conversation as read for a specific user
  async markAsRead(conversationId, userId) {
    return Message.update(
      { isRead: true },
      { where: { conversationId, senderId: { $ne: userId } } }
    );
  }
};
