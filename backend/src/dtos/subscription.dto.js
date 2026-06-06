class SubscriptionDTO {
  constructor(sub) {
    this.id                   = sub._id ?? sub.id;
    this.companyId            = sub.companyId;
    this.planId               = sub.planId;
    this.planName             = sub.planName ?? null;
    this.planPrice            = sub.planPrice ?? null;
    this.planInterval         = sub.planInterval ?? 'month';
    this.jobLimit             = sub.jobLimit ?? null;
    this.status               = sub.status;
    this.currentPeriodEnd     = sub.currentPeriodEnd;
    this.cancelAtPeriodEnd    = sub.cancelAtPeriodEnd ?? false;
    this.stripeSubscriptionId = sub.stripeSubscriptionId ?? null;
  }

  static from(sub) {
    return new SubscriptionDTO(sub);
  }
}

module.exports = SubscriptionDTO;
