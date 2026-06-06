const jwt = require('jsonwebtoken');
const conversationRepo = require('../repositories/mysql/conversation.repo');
const messageRepo = require('../repositories/mysql/message.repo');
const ConversationParticipant = require('../models/sql/ConversationParticipant');
const { notify } = require('../utils/notify');

module.exports = function initChatSocket(io) {

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: user ${socket.user.id}`);

    socket.join(`user:${socket.user.id}`);

    socket.on('join:conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('leave:conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('send:message', async (data) => {
      if (!data.conversationId || !data.message?.trim()) return;

      try {
        // Save to database
        const saved = await messageRepo.createMessage({
          conversationId: data.conversationId,
          senderId: socket.user.id,
          message: data.message.trim()
        });

        // Broadcast to everyone in the room
        io.to(`conversation:${data.conversationId}`).emit('new:message', {
          id: saved.id,
          conversationId: saved.conversationId,
          senderId: saved.senderId,
          message: saved.message,
          isRead: saved.isRead,
          createdAt: saved.createdAt
        });

        // Notify every participant who is not the sender
        const participants = await ConversationParticipant.findAll({
          where: { conversationId: data.conversationId },
        });
        for (const p of participants) {
          if (p.userId !== socket.user.id) {
            notify({ userId: p.userId, type: 'new_message', message: 'Ke një mesazh të ri' });
          }
        }
      } catch (err) {
        console.error('send:message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: user ${socket.user.id}`);
    });
  });

};