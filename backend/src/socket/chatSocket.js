const jwt = require('jsonwebtoken');
const conversationRepo = require('../repositories/mysql/conversation.repo');
const messageRepo = require('../repositories/mysql/message.repo');
const ConversationParticipant = require('../models/sql/ConversationParticipant');
const User = require('../models/sql/User');
const CreateNotificationCommand = require('../application/notification/commands/CreateNotification.command');
const createNotificationHandler = require('../application/notification/handlers/CreateNotificationHandler');

module.exports = function initChatSocket(io) {

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      socket.user = null;
      return next();
    }
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    if (socket.user) {
      console.log(`Socket connected: user ${socket.user.id}`);
      socket.join(`user:${socket.user.id}`);
    }

    socket.on('join:conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('leave:conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('send:message', async (data) => {
      if (!socket.user) return;
      if (!data.conversationId || !data.message?.trim()) return;

      try {
        // Save to database
        const saved = await messageRepo.createMessage({
          conversationId: data.conversationId,
          senderId: socket.user.id,
          message: data.message.trim()
        });

        // Broadcast to everyone in the conversation room
        io.to(`conversation:${data.conversationId}`).emit('new:message', {
          id: saved.id,
          conversationId: saved.conversationId,
          senderId: saved.senderId,
          message: saved.message,
          isRead: saved.isRead,
          createdAt: saved.createdAt
        });

        // Notify non-sender participants so they see the message in real-time
        // even when they are not currently on the chat page.
        const sender = await User.findByPk(socket.user.id, { attributes: ['firstName', 'lastName'] });
        const senderName = [sender?.firstName, sender?.lastName].filter(Boolean).join(' ') || 'Someone';

        const participants = await ConversationParticipant.findAll({
          where: { conversationId: data.conversationId },
        });
        for (const p of participants) {
          if (p.userId !== socket.user.id) {
            createNotificationHandler.handle(new CreateNotificationCommand({
              userId:  p.userId,
              type:    'new_message',
              title:   'New Message',
              message: `New message from ${senderName}`,
              link:    `/chat?cid=${data.conversationId}`,
            })).catch(() => {});
          }
        }
      } catch (err) {
        console.error('send:message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      if (socket.user) console.log(`Socket disconnected: user ${socket.user.id}`);
    });
  });

};