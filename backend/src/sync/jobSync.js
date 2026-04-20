/**
 * jobSync — CQRS read-side projection for Jobs.
 *
 * Called after every MySQL write that changes a Job.
 * Fetches the full, denormalized job state from MySQL and upserts
 * it into the MongoDB JobView collection so the read side is always
 * up to date without hitting the relational DB on queries.
 *
 * Flow:
 *   MySQL write (Job / JobSkills / JobCategories)
 *     └─► syncJob(jobId)
 *           ├─ SELECT Job + Company + Skills + Categories  (MySQL)
 *           └─ JobView.findOneAndUpdate({ jobId }, $set, { upsert: true })  (MongoDB)
 */

const { Op }   = require('sequelize');
const Job      = require('../models/sql/Job');
const Company  = require('../models/sql/Company');
const JobSkill = require('../models/sql/JobSkill');
const Skill    = require('../models/sql/Skill');
const JobCategory = require('../models/sql/JobCategory');
const Category = require('../models/sql/Category');
const jobViewRepo = require('../repositories/mongodb/jobView.repo');

/**
 * Build and upsert the MongoDB read projection for one job.
 *
 * @param {number} jobId
 * @returns {Promise<void>}
 */
async function syncJob(jobId) {
  // 1. Core job row
  const job = await Job.findByPk(jobId);
  if (!job) {
    // Job deleted — remove from read store
    await jobViewRepo.delete(jobId);
    return;
  }

  // 2. Owning company (denormalised snapshot)
  const company = job.companyId
    ? await Company.findByPk(job.companyId)
    : null;

  // 3. Required skills  → flat name array
  const jobSkills = await JobSkill.findAll({ where: { jobId } });
  let skills = [];
  if (jobSkills.length) {
    const skillIds = jobSkills.map(js => js.skillId);
    const skillRows = await Skill.findAll({ where: { id: { [Op.in]: skillIds } } });
    skills = skillRows.map(s => s.name);
  }

  // 4. Categories  → flat name array
  const jobCategories = await JobCategory.findAll({ where: { jobId } });
  let categories = [];
  if (jobCategories.length) {
    const catIds = jobCategories.map(jc => jc.categoryId);
    const catRows = await Category.findAll({ where: { id: { [Op.in]: catIds } } });
    categories = catRows.map(c => c.name);
  }

  // 5. Upsert MongoDB projection  (_id = MySQL job.id)
  await jobViewRepo.upsert({
    id:              job.id,
    recruiterId:     job.recruiterId,
    title:           job.title,
    description:     job.description,
    employmentType:  job.employmentType,
    experienceLevel: job.experienceLevel,
    workMode:        job.workMode,
    jobMode:         job.jobMode,
    budgetMin:       job.budgetMin ? Number(job.budgetMin) : null,
    budgetMax:       job.budgetMax ? Number(job.budgetMax) : null,
    status:          job.status,
    expiresAt:       job.expiresAt,
    deadline:        job.deadline,
    createdAt:       job.createdAt,
    company: company
      ? { id: company.id, name: company.name, website: company.website }
      : null,
    skills,
    categories,
  });
}

/**
 * Fire-and-forget wrapper used inside handlers.
 * Sync failures are logged but never bubble up to the HTTP response.
 *
 * @param {number} jobId
 */
function syncJobSafe(jobId) {
  syncJob(jobId).catch(err =>
    console.error(`[jobSync] Failed to sync jobId=${jobId}:`, err.message)
  );
}

module.exports = { syncJob, syncJobSafe };
