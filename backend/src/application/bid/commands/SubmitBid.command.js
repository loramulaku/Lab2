class SubmitBidCommand {
  constructor(data = {}) {
    this.jobId            = data.jobId;
    this.freelancerId     = data.freelancerId;
    this.price            = data.price;                              // amount (fixed total OR hourly rate)
    this.deliveryTimeDays = data.deliveryTimeDays;
    this.message          = data.message;
    this.coverLetter      = data.coverLetter ?? null;
    this.bidType          = data.bidType === 'hourly' ? 'hourly' : 'fixed';
    this.hoursPerWeek     = data.hoursPerWeek ?? null;
    this.startDate        = data.startDate || null;
    this.milestones       = data.milestones ?? null;                // [{ phase, price, deadline }]
    this.portfolioLinks   = data.portfolioLinks ?? null;            // [url, ...]
    this.skillsSnapshot   = data.skillsSnapshot ?? null;            // [name, ...]
  }
}
module.exports = SubmitBidCommand;
