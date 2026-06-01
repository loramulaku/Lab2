class SearchFreelancersQuery {
  constructor(filters = {}) {
    // CSV or array of skill names that must all be present.
    this.skills   = filters.skills
      ? (Array.isArray(filters.skills) ? filters.skills : String(filters.skills).split(','))
      : [];
    this.location = filters.location;
    this.q        = filters.q;            // free-text on name / headline
    this.page     = filters.page  ?? 1;
    this.limit    = filters.limit ?? 20;
  }
}
module.exports = SearchFreelancersQuery;
