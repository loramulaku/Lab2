const Notification             = require('../../../models/sql/Notification');
const { syncNotificationSafe } = require('../../../sync/notificationSync');

class MarkNotificationReadHandler {
  async handle(command) {
    await Notification.update(
      { isRead: true },
      { where: { id: command.notificationId, userId: command.userId } }
    );
    syncNotificationSafe(command.notificationId);
  }
}

module.exports = new MarkNotificationReadHandler();
