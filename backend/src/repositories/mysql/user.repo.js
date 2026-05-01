const User     = require('../../models/sql/User');
const UserRole = require('../../models/sql/UserRole');
const Role     = require('../../models/sql/Role');

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

  async findByEmailWithRoles(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) return null;
    const userRoles = await UserRole.findAll({ where: { userId: user.id } });
    const roles = userRoles.length
      ? (await Role.findAll({ where: { id: userRoles.map(ur => ur.roleId) } })).map(r => r.name)
      : [];
    return { user, roles };
  },
};

module.exports = userMysqlRepo;
