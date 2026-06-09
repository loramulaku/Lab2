class GetMyPaymentsQuery {
  constructor(companyId) {
    const parsed = Number(companyId);
    this.companyId = Number.isFinite(parsed) ? parsed : null;
  }
}
module.exports = GetMyPaymentsQuery;
