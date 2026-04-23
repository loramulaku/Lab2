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

const { Op }      = require('sequelize');
const Job         = require('../models/sql/Job');
const Company     = require('../models/sql/Company');
const JobSkill    = require('../models/sql/JobSkill');
const Skill       = require('../models/sql/Skill');
const JobCategory = require('../models/sql/JobCategory');
const Category    = require('../models/sql/Category');
const FailedSync  = require('../models/sql/FailedSync');
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
    id:             job.id,                    // mapped to _id by the repo
    title:          job.title,
    description:    job.description,
    employmentType: job.employmentType,
    workMode:       job.workMode,
    jobMode:        job.jobMode,
    budgetMin:      job.budgetMin ? Number(job.budgetMin) : null,
    budgetMax:      job.budgetMax ? Number(job.budgetMax) : null,
    status:         job.status,
    expiresAt:      job.expiresAt,
    deadline:       job.deadline,
    createdAt:      job.createdAt,
    company: company
      ? { id: company.id, name: company.name, website: company.website }
      : null,
    skills,
    categories,
  });

  // Sync succeeded — clear any previous failure record
  await FailedSync.destroy({ where: { entityType: 'job', entityId: jobId } });
}

/**
 * Fire-and-forget wrapper used inside handlers.
 * On failure, logs the error to the FailedSyncs table so it can be retried.
 * On success, the FailedSyncs record is cleared inside syncJob().
 *
 * @param {number} jobId
 */
function syncJobSafe(jobId) {
  syncJob(jobId).catch(async (err) => {
    console.error(`[jobSync] Failed to sync jobId=${jobId}:`, err.message);
    try {
      const [record, created] = await FailedSync.findOrCreate({
        where: { entityType: 'job', entityId: jobId },
        defaults: {
          entityType:      'job',
          entityId:        jobId,
          errorMessage:    err.message,
          attempts:        1,
          lastAttemptedAt: new Date(),
          createdAt:       new Date(),
        },
      });
      if (!created) {
        // Record already existed — increment attempts
        await record.update({
          errorMessage:    err.message,
          attempts:        record.attempts + 1,
          lastAttemptedAt: new Date(),
          resolvedAt:      null,
        });
      }
    } catch (dbErr) {
      console.error('[jobSync] Could not write to FailedSyncs:', dbErr.message);
    }
  });
}

module.exports = { syncJob, syncJobSafe };
