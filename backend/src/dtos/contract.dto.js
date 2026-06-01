/**
 * ContractDTO — shapes contract responses.
 * Accepts a Sequelize Contract (write side) or a ContractView (read side).
 */
class ContractDTO {
  constructor(c) {
    this.id           = c.id ?? c._id;
    this.jobId        = c.jobId;
    this.freelancerId = c.freelancerId;
    this.companyId    = c.companyId;
    this.bidId        = c.bidId ?? null;
    this.invitationId = c.invitationId ?? null;
    this.source       = c.source ?? null;
    this.agreedPrice  = c.agreedPrice != null ? Number(c.agreedPrice) : null;
    this.startDate    = c.startDate ?? null;
    this.endDate      = c.endDate ?? null;
    this.status       = c.status;
    this.jobTitle     = c.jobTitle ?? null;
    this.companyName  = c.companyName ?? null;
    this.freelancer   = (c.freelancerFirstName || c.freelancerLastName)
      ? { firstName: c.freelancerFirstName ?? null, lastName: c.freelancerLastName ?? null }
      : null;
    this.createdAt    = c.createdAt ?? null;
  }

  static from(c) {
    return new ContractDTO(c);
  }

  static fromList(list) {
    return list.map(ContractDTO.from);
  }
}

module.exports = ContractDTO;
