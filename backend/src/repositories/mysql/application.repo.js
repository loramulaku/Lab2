const Application = require('../../models/sql/Application');
const Job = require('../../models/sql/Job');
const User = require('../../models/sql/User');
const createMysqlRepo = require('./_factory');
const { sequelize } = require('../../config/mysql');

const baseRepo = createMysqlRepo(Application);

module.exports = {
  ...baseRepo,
  
  async findAll({ limit = 10, offset = 0, status = '', sortBy = 'created_at', sortOrder = 'DESC' }) {
    const where = status ? { status } : {};

    const { count, rows } = await Application.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
      include: [
        { model: Job, attributes: ['id', 'title'] },
        { model: User, as: 'Candidate', attributes: ['id', 'firstName', 'lastName', 'email'] },
      ],
    });

    return { applications: rows, total: count };
  },

  async getStats() {
    const total = await Application.count();
    const pending = await Application.count({ where: { status: 'pending' } });
    const reviewed = await Application.count({ where: { status: 'reviewed' } });
    const accepted = await Application.count({ where: { status: 'accepted' } });
    const rejected = await Application.count({ where: { status: 'rejected' } });

    return { total, pending, reviewed, accepted, rejected };
  },
};
