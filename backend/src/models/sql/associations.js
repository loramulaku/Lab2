const User         = require('./User');
const Role         = require('./Role');
const UserRole     = require('./UserRole');
const Subscription = require('./Subscription');
const Plan         = require('./Plan');

User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId' });

UserRole.belongsTo(User, { foreignKey: 'userId' });
UserRole.belongsTo(Role, { foreignKey: 'roleId' });

Subscription.belongsTo(Plan, { foreignKey: 'planId', as: 'Plan' });
Plan.hasMany(Subscription,   { foreignKey: 'planId', as: 'Subscriptions' });

module.exports = { User, Role, UserRole, Subscription, Plan };
