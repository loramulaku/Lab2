class AddSkillCommand {
  constructor({ userId, name, level }) {
    this.userId = userId;
    this.name   = name;
    this.level  = level;
  }
}
module.exports = AddSkillCommand;
