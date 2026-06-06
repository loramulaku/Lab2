class CreateNotificationCommand {
  constructor({ userId, type, message, link = null }) {
    this.userId  = userId;
    this.type    = type;
    this.message = message;
    this.link    = link;
  }
}

module.exports = CreateNotificationCommand;
