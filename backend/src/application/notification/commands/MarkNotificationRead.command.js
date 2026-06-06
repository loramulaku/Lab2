class MarkNotificationReadCommand {
  constructor({ notificationId, userId }) {
    this.notificationId = notificationId;
    this.userId         = userId;
  }
}

module.exports = MarkNotificationReadCommand;
