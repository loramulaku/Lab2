class BidDTO {
  constructor(b) {
    this.id                  = b.id ?? b._id;
    this.jobId               = b.jobId;
    this.freelancerId        = b.freelancerId;
    this.price               = b.price;
    this.deliveryTimeDays    = b.deliveryTimeDays;
    this.message             = b.message ?? null;
    this.status              = b.status;
    this.invitationId        = b.invitationId ?? null;
    this.createdAt           = b.createdAt;
    this.jobTitle            = b.jobTitle            ?? null;
    this.companyName         = b.companyName         ?? null;
    this.freelancerFirstName = b.freelancerFirstName ?? null;
    this.freelancerLastName  = b.freelancerLastName  ?? null;
  }

  static from(b)      { return new BidDTO(b); }
  static fromList(bs) { return bs.map(BidDTO.from); }
}

module.exports = BidDTO;
