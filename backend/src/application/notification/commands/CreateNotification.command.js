class CreateNotificationCommand {
  constructor({ userId, type, message, link = null, applicationId = null }) {
    this.userId        = userId;
    this.type          = type;
    this.message       = message;
    this.link          = link;
    this.applicationId = applicationId;
  }
}

module.exports = CreateNotificationCommand;
