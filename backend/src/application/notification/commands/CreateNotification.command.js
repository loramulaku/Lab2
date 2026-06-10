class CreateNotificationCommand {
  constructor({ userId, type, title = null, message, link = null, applicationId = null }) {
    this.userId        = userId;
    this.type          = type;
    this.title         = title;
    this.message       = message;
    this.link          = link;
    this.applicationId = applicationId;
  }
}

module.exports = CreateNotificationCommand;
