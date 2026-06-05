const JobView        = require('../../models/nosql/JobView');
const createMongoRepo = require('./_factory');

// sort-key → Mongoose sort descriptor
const SORT_MAP = {
  relevance:        { _id: -1 },
  newest:           { _id: -1 },
  salary_high:      { budgetMax: -1, budgetMin: -1 },
  salary_low:       { budgetMin:  1, budgetMax:  1 },
  most_applicants:  { applicationCount: -1 },
};

const jobViewRepo = {
  ...createMongoRepo(JobView),

  async upsert(data) {
    const { id, ...rest } = data;
    return JobView.findOneAndUpdate(
      { _id: id },
      { $set: rest },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  },

  /**
   * List jobs with filters, full-text search, location, and sort.
   *
   * Filters:
   *   status, employmentType, workMode, experienceLevel,
   *   companyId, skill, q (text search), location,
   *   minSalary (budgetMax or budgetMin >= value),
   *   sort (relevance | newest | salary_high | salary_low | most_applicants)
   */
  async findAll({
    status, workMode, employmentType, companyId, skill,
    q, location, experienceLevel, minSalary,
    sort, page, limit, maxSalary, category,
    excludeInviteOnly,
  } = {}) {
    const filter = {};
    const and = [];

    if (status)          filter.status          = status;
    if (workMode)        filter.workMode         = workMode;
    if (employmentType)  filter.employmentType   = employmentType;
    if (experienceLevel) filter.experienceLevel  = experienceLevel;
    if (companyId)       filter['company.id']    = Number(companyId);
    if (skill)           filter.skills           = skill;

    if (q) {
      const re = new RegExp(q, 'i');
      and.push({ $or: [{ title: re }, { 'company.name': re }, { skills: re }, { description: re }] });
    }
    if (location) {
      filter['company.location'] = new RegExp(location, 'i');
    }
    if (minSalary) {
      const n = Number(minSalary);
      if (!isNaN(n) && n > 0) {
        and.push({ $or: [{ budgetMin: { $gte: n } }, { budgetMax: { $gte: n } }] });
      }
    }
    if (maxSalary) {
      const n = Number(maxSalary);
      if (!isNaN(n) && n > 0) {
        and.push({ $or: [{ budgetMin: { $lte: n } }, { budgetMax: { $lte: n } }, { budgetMin: null }, { budgetMax: null }] });
      }
    }
    if (category) {
      filter.categories = category;   // matches any doc where categories array contains this string
    }

    // Exclude invite-only freelance jobs from the public candidate-facing listing
    if (excludeInviteOnly) {
      and.push({ $or: [{ workMode: { $ne: 'freelance' } }, { jobMode: { $ne: 'invite' } }] });
    }

    if (and.length) filter.$and = and;

    const pg  = Math.max(Number(page)  || 1,   1);
    const lim = Math.min(Number(limit) || 20, 200);
    const sortDoc = SORT_MAP[sort] ?? SORT_MAP.newest;

    const [data, total] = await Promise.all([
      JobView.find(filter).sort(sortDoc).skip((pg - 1) * lim).limit(lim).lean(),
      JobView.countDocuments(filter),
    ]);

    return { data, total, page: pg, limit: lim, pages: Math.ceil(total / lim) };
  },

  async findByJobId(jobId) {
    return JobView.findById(Number(jobId)).lean();
  },

  async delete(jobId) {
    return JobView.findByIdAndDelete(Number(jobId));
  },
};

module.exports = jobViewRepo;
