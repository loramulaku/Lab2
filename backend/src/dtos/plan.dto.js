class PlanDTO {
  constructor(plan) {
    this.id       = plan._id ?? plan.id;
    this.name     = plan.name;
    this.price    = plan.price;
    this.jobLimit = plan.jobLimit ?? null;
    this.isActive = plan.isActive ?? true;
  }

  static from(plan) {
    return new PlanDTO(plan);
  }

  static fromList(plans) {
    return plans.map(PlanDTO.from);
  }
}

module.exports = PlanDTO;
