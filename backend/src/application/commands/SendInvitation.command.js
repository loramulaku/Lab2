class SendInvitationCommand {
  constructor({ companyId, freelancerId, jobId, price, deliveryTimeDays, message }) {
    this.companyId        = companyId;
    this.freelancerId     = freelancerId;
    this.jobId            = jobId ?? null;
    this.price            = price;
    this.deliveryTimeDays = deliveryTimeDays;
    this.message          = message ?? null;
  }
}

module.exports = SendInvitationCommand;
