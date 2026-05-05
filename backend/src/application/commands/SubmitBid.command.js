class SubmitBidCommand {
  constructor({ jobId, freelancerId, price, deliveryTimeDays, message }) {
    this.jobId           = jobId;
    this.freelancerId    = freelancerId;
    this.price           = price;
    this.deliveryTimeDays = deliveryTimeDays;
    this.message         = message ?? null;
  }
}

module.exports = SubmitBidCommand;
