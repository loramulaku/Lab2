class DeleteSkillCommand {
  constructor({ userId, skillId }) {
    this.userId  = userId;
    this.skillId = skillId;
  }
}
module.exports = DeleteSkillCommand;
