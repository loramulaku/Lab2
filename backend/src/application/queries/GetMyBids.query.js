class GetMyBidsQuery {
  constructor({ userId, page, limit }) {
    this.userId = userId;
    this.page   = page;
    this.limit  = limit;
  }
}
module.exports = GetMyBidsQuery;
