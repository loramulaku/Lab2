const { Op } = require('sequelize');
const Conversation = require('../../models/sql/Conversation');
const ConversationParticipant = require('../../models/sql/ConversationParticipant');
const Message = require('../../models/sql/Message');
const createMysqlRepo = require('./_factory');

const base = createMysqlRepo(Conversation);

module.exports = {
  ...base,

  // Find existing conversation between exactly two users
  async findBetweenUsers(userIdA, userIdB) {
    const a = await ConversationParticipant.findAll({ where: { userId: userIdA } });
    const b = await ConversationParticipant.findAll({ where: { userId: userIdB } });
    const aIds = a.map(p => p.conversationId);
    const bIds = b.map(p => p.conversationId);
    const shared = aIds.find(id => bIds.includes(id));
    return shared ? Conversation.findByPk(shared) : null;
  },

  // Create conversation and add both users as participants
  async createWithParticipants(userIdA, userIdB) {
    const conversation = await Conversation.create({ createdAt: new Date() });
    await ConversationParticipant.create({ conversationId: conversation.id, userId: userIdA });
    await ConversationParticipant.create({ conversationId: conversation.id, userId: userIdB });
    return conversation;
  },

  // Get or create a conversation between two users
  async findOrCreateBetweenUsers(userIdA, userIdB) {
    const existing = await this.findBetweenUsers(userIdA, userIdB);
    if (existing) return existing;
    return this.createWithParticipants(userIdA, userIdB);
  },

  // Get all conversations for a user, with the last message
  async findAllForUser(userId) {
    const participations = await ConversationParticipant.findAll({
      where: { userId }
    });
    const conversationIds = participations.map(p => p.conversationId);
    if (!conversationIds.length) return [];

    const conversations = await Conversation.findAll({
      where: { id: { [Op.in]: conversationIds } }
    });

    // Attach participants and last message to each conversation
    const result = await Promise.all(conversations.map(async (conv) => {
      const participants = await ConversationParticipant.findAll({
        where: { conversationId: conv.id }
      });
      const lastMessage = await Message.findOne({
        where: { conversationId: conv.id },
        order: [['created_at', 'DESC']]
      });
      return {
        id: conv.id,
        createdAt: conv.createdAt,
        participants: participants.map(p => p.userId),
        lastMessage: lastMessage || null
      };
    }));

    return result;
  }
};
