class CreatePlanCommand {
  constructor(data) {
    this.name     = data.name;
    this.price    = Number(data.price);
    this.jobLimit = data.jobLimit != null ? Number(data.jobLimit) : null;
  }
}
module.exports = CreatePlanCommand;
