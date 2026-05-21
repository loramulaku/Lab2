class DeleteEducationCommand {
  constructor({ userId, educationId }) {
    this.userId      = userId;
    this.educationId = educationId;
  }
}
module.exports = DeleteEducationCommand;
