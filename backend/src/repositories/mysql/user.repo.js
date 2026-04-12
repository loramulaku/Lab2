const User = require('../../models/sql/User');

/**
 * MySQL WRITE repository for Users.
 */
const userMysqlRepo = {
  async create(data) {
    return User.create(data);
  },

  async update(userId, data) {
    return User.update(data, { where: { id: userId } });
  },

  async findByEmail(email) {
    return User.findOne({ where: { email } });
  },

  async findById(userId) {
    return User.findByPk(userId);
  },

  async delete(userId) {
    return User.destroy({ where: { id: userId } });
  },
};

module.exports = userMysqlRepo;
