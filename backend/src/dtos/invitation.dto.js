/**
 * InvitationDTO — shapes invitation responses for recruiter & freelancer.
 * Accepts a Sequelize Invitation (write side) or an InvitationView (read side).
 */
class InvitationDTO {
  constructor(inv) {
    this.id               = inv.id ?? inv._id;
    this.companyId        = inv.companyId;
    this.freelancerId     = inv.freelancerId;
    this.jobId            = inv.jobId ?? null;
    this.title            = inv.title ?? inv.jobTitle ?? null;
    this.message          = inv.message ?? null;
    this.priceOffer       = inv.priceOffer != null ? Number(inv.priceOffer) : null;
    this.deliveryTimeDays = inv.deliveryTimeDays ?? null;
    this.status           = inv.status;
    this.expiresAt        = inv.expiresAt ?? null;
    this.respondedAt      = inv.respondedAt ?? null;
    this.companyName      = inv.companyName ?? null;
    this.freelancer       = (inv.freelancerFirstName || inv.freelancerLastName)
      ? { firstName: inv.freelancerFirstName ?? null, lastName: inv.freelancerLastName ?? null }
      : null;
    this.createdAt        = inv.createdAt ?? null;
  }

  static from(inv) {
    return new InvitationDTO(inv);
  }

  static fromList(list) {
    return list.map(InvitationDTO.from);
  }
}

module.exports = InvitationDTO;
