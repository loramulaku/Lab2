const Job      = require('../../models/sql/Job');
const JobSkill = require('../../models/sql/JobSkill');
const JobCategory = require('../../models/sql/JobCategory');
const Company = require('../../models/sql/Company');
const { sequelize } = require('../../config/mysql');

/**
 * MySQL WRITE repository for Jobs.
 * All mutations go through here — never read from this repo in query handlers.
 */
const jobMysqlRepo = {
  async create(data) {
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
    await Job.update(data, { where: { id: jobId } });
    return Job.findByPk(jobId);
  },

  async delete(jobId) {
    return Job.destroy({ where: { id: jobId } });
  },

  async findById(jobId) {
    return Job.findByPk(jobId);
  },

  async findAll({ limit = 10, offset = 0, search = '', status = '', sortBy = 'created_at', sortOrder = 'DESC' }) {
    const where = {};
    
    if (search) {
      where[sequelize.Sequelize.Op.or] = [
        { title: { [sequelize.Sequelize.Op.like]: `%${search}%` } },
        { description: { [sequelize.Sequelize.Op.like]: `%${search}%` } },
      ];
    }
    
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Job.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
      include: [{ model: Company, attributes: ['id', 'name'] }],
    });

    return { jobs: rows, total: count };
  },
};

module.exports = jobMysqlRepo;
