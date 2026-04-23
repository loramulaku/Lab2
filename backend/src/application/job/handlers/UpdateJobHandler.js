const jobMysqlRepo    = require('../../../repositories/mysql/job.repo');
const JobSkill        = require('../../../models/sql/JobSkill');
const JobCategory     = require('../../../models/sql/JobCategory');
const { syncJobSafe } = require('../../../sync/jobSync');

class UpdateJobHandler {
  async handle(command) {
    const { jobId, skillIds, categoryIds, ...fields } = command;

    // Only pass defined scalar fields to the SQL update
    const coreData = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );

    // Only hit the DB with an UPDATE when there are actual scalar fields to change.
    // When only skillIds/categoryIds are provided, coreData is empty and
    // Job.update({}, ...) returns 0 affected rows — so skip straight to findById.
    let job;
    if (Object.keys(coreData).length > 0) {
      job = await jobMysqlRepo.update(jobId, coreData);
      if (!job) return null;
    } else {
      job = await jobMysqlRepo.findById(jobId);
      if (!job) return null;
    }

    // Replace skill associations when skillIds is explicitly provided
    if (skillIds !== undefined) {
      await JobSkill.destroy({ where: { jobId } });
      if (skillIds.length) {
        await JobSkill.bulkCreate(skillIds.map(skillId => ({ jobId, skillId })));
      }
    }

    // Replace category associations when categoryIds is explicitly provided
    if (categoryIds !== undefined) {
      await JobCategory.destroy({ where: { jobId } });
      if (categoryIds.length) {
        await JobCategory.bulkCreate(categoryIds.map(categoryId => ({ jobId, categoryId })));
      }
    }

    syncJobSafe(jobId);
    return job;
  }
}

module.exports = new UpdateJobHandler();
