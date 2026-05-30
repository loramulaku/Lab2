const User         = require('./User');
const Role         = require('./Role');
const UserRole     = require('./UserRole');
const Subscription = require('./Subscription');
const Plan         = require('./Plan');
const Job          = require('./Job');
const Application  = require('./Application');
const Pipeline     = require('./Pipeline');
const PipelineStage = require('./PipelineStage');
const StageHistory  = require('./StageHistory');

User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId' });

UserRole.belongsTo(User, { foreignKey: 'userId' });
UserRole.belongsTo(Role, { foreignKey: 'roleId' });

Subscription.belongsTo(Plan, { foreignKey: 'planId', as: 'Plan' });
Plan.hasMany(Subscription,   { foreignKey: 'planId', as: 'Subscriptions' });

// Pipeline associations
Pipeline.belongsTo(Job, { foreignKey: 'jobId' });
Job.hasOne(Pipeline, { foreignKey: 'jobId' });

Pipeline.hasMany(PipelineStage, { foreignKey: 'pipelineId', as: 'stages' });
PipelineStage.belongsTo(Pipeline, { foreignKey: 'pipelineId' });

StageHistory.belongsTo(Application, { foreignKey: 'applicationId' });
Application.hasMany(StageHistory, { foreignKey: 'applicationId', as: 'stageHistory' });

StageHistory.belongsTo(PipelineStage, { foreignKey: 'toStageId', as: 'toStage' });
StageHistory.belongsTo(PipelineStage, { foreignKey: 'fromStageId', as: 'fromStage' });

StageHistory.belongsTo(User, { foreignKey: 'changedBy', as: 'changedByUser' });

module.exports = { User, Role, UserRole, Subscription, Plan, Job, Application, Pipeline, PipelineStage, StageHistory };
