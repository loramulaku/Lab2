class UpdatePlanCommand {
  constructor(data) {
    this.id       = Number(data.id);
    this.name     = data.name;
    this.price    = data.price != null ? Number(data.price) : undefined;
    this.jobLimit = data.jobLimit !== undefined ? (data.jobLimit != null ? Number(data.jobLimit) : null) : undefined;
  }
}
module.exports = UpdatePlanCommand;
