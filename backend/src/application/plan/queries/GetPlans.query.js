class GetPlansQuery {
  constructor({ activeOnly = true } = {}) {
    this.activeOnly = activeOnly;
  }
}
module.exports = GetPlansQuery;
