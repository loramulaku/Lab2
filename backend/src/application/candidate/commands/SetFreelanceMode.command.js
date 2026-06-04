class SetFreelanceModeCommand {
  constructor({ userId, active }) {
    this.userId = userId;
    this.active = active;
  }
}
module.exports = SetFreelanceModeCommand;
