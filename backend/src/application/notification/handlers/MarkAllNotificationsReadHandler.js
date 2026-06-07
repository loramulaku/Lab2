const Notification             = require('../../../models/sql/Notification');
const NotificationView         = require('../../../models/nosql/NotificationView');

class MarkAllNotificationsReadHandler {
  async handle(command) {
    await Notification.update(
      { isRead: true },
      { where: { userId: command.userId, isRead: false } }
    );
    // Bulk-update MongoDB projection directly (no per-row sync overhead)
    await NotificationView.updateMany({ userId: command.userId, isRead: false }, { $set: { isRead: true } });
  }
}

module.exports = new MarkAllNotificationsReadHandler();
