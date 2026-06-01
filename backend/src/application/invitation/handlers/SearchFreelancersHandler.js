const CandidateProfileView = require('../../../models/nosql/CandidateProfileView');
const { paginate } = require('../../../utils/pagination');

/**
 * Mode B freelancer search — reads the denormalised candidate projection.
 * Filters by required skills (all must match) + optional location + free text.
 *
 * NOTE: rating / price-range filters from the design require those fields to
 * be added to CandidateProfileView (not currently projected); search by skills
 * and location is supported today.
 */
class SearchFreelancersHandler {
  async handle(query) {
    const filter = {};

    if (query.skills?.length) {
      filter['skills.name'] = { $all: query.skills };
    }
    if (query.location) {
      filter.location = query.location;
    }
    if (query.q) {
      const rx = new RegExp(query.q, 'i');
      filter.$or = [{ firstName: rx }, { lastName: rx }, { headline: rx }];
    }

    return paginate(CandidateProfileView, filter, { page: query.page, limit: query.limit });
  }
}

module.exports = new SearchFreelancersHandler();
