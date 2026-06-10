const CandidateProfileView = require('../../../models/nosql/CandidateProfileView');

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

class BrowseCandidatesHandler {
  async handle(query) {
    const filter = {};
    const and    = [];

    if (query.freelanceActive !== undefined) {
      filter.freelanceActive = query.freelanceActive;
    }
    if (query.skills?.length) {
      filter['skills.name'] = { $all: query.skills.map(s => new RegExp('^' + escapeRegex(s) + '$', 'i')) };
    }
    if (query.location) {
      filter.location = new RegExp(query.location, 'i');
    }
    if (query.q) {
      const rx = new RegExp(query.q, 'i');
      and.push({ $or: [{ firstName: rx }, { lastName: rx }, { headline: rx }, { bio: rx }] });
    }
    if (!isNaN(query.minYears) && query.minYears >= 0) {
      and.push({ yearsExperience: { $gte: query.minYears } });
    }
    if (!isNaN(query.maxYears) && query.maxYears >= 0) {
      and.push({ yearsExperience: { $lte: query.maxYears } });
    }

    if (and.length) filter.$and = and;

    const pg  = Math.max(Number(query.page)  || 1,   1);
    const lim = Math.min(Number(query.limit) || 20, 100);

    const [data, total] = await Promise.all([
      CandidateProfileView.find(filter)
        .sort({ _id: -1 })
        .skip((pg - 1) * lim)
        .limit(lim)
        .lean(),
      CandidateProfileView.countDocuments(filter),
    ]);

    return { data, total, page: pg, limit: lim, pages: Math.ceil(total / lim) };
  }
}

module.exports = new BrowseCandidatesHandler();
