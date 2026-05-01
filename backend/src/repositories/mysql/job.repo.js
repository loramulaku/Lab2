const Job      = require('../../models/sql/Job');
const JobSkill = require('../../models/sql/JobSkill');
const JobCategory = require('../../models/sql/JobCategory');

/**
 * MySQL WRITE repository for Jobs.
 * All mutations go through here — never read from this repo in query handlers.
 */
const jobMysqlRepo = {
  async create(data, { transaction } = {}) {
    const job = await Job.create({
      companyId:       data.companyId,
      recruiterId:     data.recruiterId,
      title:           data.title,
      description:     data.description,
      employmentType:  data.employmentType,
      experienceLevel: data.experienceLevel,
      workMode:        data.workMode,
      jobMode:         data.jobMode,
      budgetMin:       data.budgetMin,
      budgetMax:       data.budgetMax,
      expiresAt:       data.expiresAt,
      deadline:        data.deadline,
      status:          'open',
    }, { transaction });

    if (data.skillIds?.length) {
      await JobSkill.bulkCreate(
        data.skillIds.map(skillId => ({ jobId: job.id, skillId })),
        { transaction }
      );
    }
    if (data.categoryIds?.length) {
      await JobCategory.bulkCreate(
        data.categoryIds.map(categoryId => ({ jobId: job.id, categoryId })),
        { transaction }
      );
    }

    return job;
  },

  async update(jobId, data) {
    await Job.update(data, { where: { id: jobId } });
    return Job.findByPk(jobId);
  },

  async delete(jobId) {
    return Job.destroy({ where: { id: jobId } });
  },

  async findById(jobId) {
    return Job.findByPk(jobId);
  },
};

module.exports = jobMysqlRepo;
