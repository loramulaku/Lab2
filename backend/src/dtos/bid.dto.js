/**
 * BidDTO — shapes the public-facing bid response.
 * Accepts either a Sequelize Bid (write side) or a BidView doc (read side).
 */
class BidDTO {
  constructor(bid) {
    this.id               = bid.id ?? bid._id;
    this.jobId            = bid.jobId;
    this.freelancerId     = bid.freelancerId;
    this.price            = bid.price != null ? Number(bid.price) : null;
    this.deliveryTimeDays = bid.deliveryTimeDays;
    this.message          = bid.message ?? null;
    this.coverLetter      = bid.coverLetter ?? null;
    this.bidType          = bid.bidType ?? 'fixed';
    this.hoursPerWeek     = bid.hoursPerWeek ?? null;
    this.startDate        = bid.startDate ?? null;
    this.milestones       = bid.milestones ?? null;
    this.portfolioLinks   = bid.portfolioLinks ?? null;
    this.skillsSnapshot   = bid.skillsSnapshot ?? null;
    this.status           = bid.status;
    this.jobTitle         = bid.jobTitle ?? null;
    this.companyName      = bid.companyName ?? null;
    this.freelancer       = (bid.freelancerFirstName || bid.freelancerLastName)
      ? { firstName: bid.freelancerFirstName ?? null, lastName: bid.freelancerLastName ?? null }
      : null;
    this.createdAt        = bid.createdAt ?? null;
  }

  static from(bid) {
    return new BidDTO(bid);
  }

  static fromList(bids) {
    return bids.map(BidDTO.from);
  }
}

module.exports = BidDTO;
