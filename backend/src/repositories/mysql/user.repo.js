const User = require('../../models/sql/User');
const UserRole = require('../../models/sql/UserRole');
const Role = require('../../models/sql/Role');
const { sequelize } = require('../../config/mysql');

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

  async getUserRoles(userId) {
    const userRoles = await UserRole.findAll({
      where: { userId },
      include: [{ model: Role, attributes: ['id', 'name'] }],
    });
    return userRoles.map(ur => ur.Role?.name).filter(Boolean);
  },

  async findAll({ limit = 10, offset = 0, search = '', sortBy = 'created_at', sortOrder = 'DESC' }) {
    const where = search 
      ? {
          [sequelize.Sequelize.Op.or]: [
            { firstName: { [sequelize.Sequelize.Op.like]: `%${search}%` } },
            { lastName: { [sequelize.Sequelize.Op.like]: `%${search}%` } },
            { email: { [sequelize.Sequelize.Op.like]: `%${search}%` } },
          ]
        }
      : {};

    const { count, rows } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
    });

    return { users: rows, total: count };
  },

  async assignRole(userId, roleId) {
    return UserRole.create({ userId, roleId });
  },

  async removeRole(userId, roleId) {
    return UserRole.destroy({ where: { userId, roleId } });
  },
};

module.exports = userMysqlRepo;
