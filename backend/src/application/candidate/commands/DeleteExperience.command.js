class DeleteExperienceCommand {
  constructor({ userId, experienceId }) {
    this.userId       = userId;
    this.experienceId = experienceId;
  }
}
module.exports = DeleteExperienceCommand;
