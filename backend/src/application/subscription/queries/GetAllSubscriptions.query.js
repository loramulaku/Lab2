class GetAllSubscriptionsQuery {
  constructor({ page = 1, limit = 20 } = {}) {
    this.page  = Number(page);
    this.limit = Number(limit);
  }
}
module.exports = GetAllSubscriptionsQuery;
