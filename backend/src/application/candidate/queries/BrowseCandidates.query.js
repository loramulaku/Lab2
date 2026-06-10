class BrowseCandidatesQuery {
  constructor(filters = {}) {
    this.q               = filters.q;
    this.skills          = filters.skills
      ? (Array.isArray(filters.skills) ? filters.skills : String(filters.skills).split(',').map(s => s.trim()).filter(Boolean))
      : [];
    this.location        = filters.location;
    this.freelanceActive = filters.freelanceActive === 'true' ? true
                         : filters.freelanceActive === 'false' ? false
                         : undefined;
    this.minYears        = filters.minYears != null ? Number(filters.minYears) : undefined;
    this.maxYears        = filters.maxYears != null ? Number(filters.maxYears) : undefined;
    this.page            = filters.page  ?? 1;
    this.limit           = filters.limit ?? 20;
  }
}
module.exports = BrowseCandidatesQuery;
