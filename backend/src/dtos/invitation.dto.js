class InvitationDTO {
  constructor(i) {
    this.id                  = i.id ?? i._id;
    this.companyId           = i.companyId;
    this.freelancerId        = i.freelancerId;
    this.jobId               = i.jobId ?? null;
    this.message             = i.message ?? null;
    this.priceOffer          = i.priceOffer;
    this.deliveryTimeDays    = i.deliveryTimeDays;
    this.status              = i.status;
    this.createdAt           = i.createdAt;
    this.companyName         = i.companyName         ?? null;
    this.jobTitle            = i.jobTitle            ?? null;
    this.freelancerFirstName = i.freelancerFirstName ?? null;
    this.freelancerLastName  = i.freelancerLastName  ?? null;
  }

  static from(i)      { return new InvitationDTO(i); }
  static fromList(is) { return is.map(InvitationDTO.from); }
}

module.exports = InvitationDTO;
