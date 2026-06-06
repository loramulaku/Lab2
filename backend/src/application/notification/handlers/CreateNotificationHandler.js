const Notification             = require('../../../models/sql/Notification');
const { syncNotificationSafe } = require('../../../sync/notificationSync');
const { getIo }                = require('../../../socket/ioInstance');

class CreateNotificationHandler {
  async handle(command) {
    const notification = await Notification.create({
      userId:    command.userId,
      type:      command.type,
      message:   command.message,
      link:      command.link ?? null,
      isRead:    false,
      createdAt: new Date(),
    });

    // Project to MongoDB read-side
    syncNotificationSafe(notification.id);

    // Push to connected client in real-time (best-effort)
    const io = getIo();
    if (io) {
      io.to(`user:${command.userId}`).emit('notification:new', {
        id:        notification.id,
        type:      notification.type,
        message:   notification.message,
        link:      notification.link ?? null,
        isRead:    false,
        createdAt: notification.createdAt,
      });
    }

    return notification;
  }
}

module.exports = new CreateNotificationHandler();
