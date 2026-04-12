const Job      = require('../../models/sql/Job');
const JobSkill = require('../../models/sql/JobSkill');
const JobCategory = require('../../models/sql/JobCategory');

/**
 * MySQL WRITE repository for Jobs.
 * All mutations go through here — never read from this repo in query handlers.
 */
const jobMysqlRepo = {
  async create(data) {
    const job = await Job.create({
      companyId:      data.companyId,
      title:          data.title,
      description:    data.description,
      employmentType: data.employmentType,
      workMode:       data.workMode,
      jobMode:        data.jobMode,
      budgetMin:      data.budgetMin,
      budgetMax:      data.budgetMax,
      expiresAt:      data.expiresAt,
      deadline:       data.deadline,
      status:         'open',
    });

    if (data.skillIds?.length) {
      await JobSkill.bulkCreate(
        data.skillIds.map(skillId => ({ jobId: job.id, skillId }))
      );
    }
    if (data.categoryIds?.length) {
      await JobCategory.bulkCreate(
        data.categoryIds.map(categoryId => ({ jobId: job.id, categoryId }))
      );
    }

    return job;
  },

  async update(jobId, data) {
    const [, [updated]] = await Job.update(data, {
      where: { id: jobId },
      returning: true,
    });
    return updated;
  },

  async delete(jobId) {
    return Job.destroy({ where: { id: jobId } });
  },

  async findById(jobId) {
    return Job.findByPk(jobId);
  },
};

module.exports = jobMysqlRepo;
