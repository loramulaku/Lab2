class CreateContractCommand {
  constructor({ companyId, source, bidId, invitationId, applicationId, agreedPrice, startDate, endDate }) {
    this.companyId     = companyId;
    this.source        = source;        // 'bid' | 'invitation' | 'pipeline'
    this.bidId         = bidId         ?? null;
    this.invitationId  = invitationId  ?? null;
    this.applicationId = applicationId ?? null;
    this.agreedPrice   = agreedPrice;
    this.startDate     = startDate;
    this.endDate       = endDate       ?? null;
  }
}

module.exports = CreateContractCommand;
