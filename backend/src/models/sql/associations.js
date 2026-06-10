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
const Notification = require('./Notification');
const Company      = require('./Company');
const Bid          = require('./Bid');
const Invitation   = require('./Invitation');
const Contract     = require('./Contract');
const SavedJob         = require('./SavedJob');
const Payment          = require('./Payment');
const RecruiterProfile = require('./RecruiterProfile');

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

Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

// Job ↔ Company
Company.hasMany(Job, { foreignKey: 'companyId' });
Job.belongsTo(Company, { foreignKey: 'companyId' });

// Hybrid hiring flow (Modes A/B/C)
Job.hasMany(Bid, { foreignKey: 'jobId' });
Bid.belongsTo(Job, { foreignKey: 'jobId' });
Bid.belongsTo(User, { foreignKey: 'freelancerId', as: 'freelancer' });

Job.hasMany(Invitation, { foreignKey: 'jobId' });
Invitation.belongsTo(Job, { foreignKey: 'jobId' });
Invitation.belongsTo(Company, { foreignKey: 'companyId' });
Invitation.belongsTo(User, { foreignKey: 'freelancerId', as: 'freelancer' });

Job.hasMany(Contract, { foreignKey: 'jobId' });
Contract.belongsTo(Job, { foreignKey: 'jobId' });
Contract.belongsTo(Company, { foreignKey: 'companyId' });
Contract.belongsTo(User, { foreignKey: 'freelancerId', as: 'freelancer' });
Contract.belongsTo(Bid, { foreignKey: 'bidId' });
Contract.belongsTo(Invitation, { foreignKey: 'invitationId' });

// Payment ↔ Plan / Company
Payment.belongsTo(Plan,    { foreignKey: 'planId',    as: 'Plan' });
Plan.hasMany(Payment,      { foreignKey: 'planId',    as: 'Payments' });
Payment.belongsTo(Company, { foreignKey: 'companyId' });
Company.hasMany(Payment,   { foreignKey: 'companyId' });

// RecruiterProfile ↔ User / Company
RecruiterProfile.belongsTo(User,    { foreignKey: 'userId' });
User.hasOne(RecruiterProfile,       { foreignKey: 'userId' });
RecruiterProfile.belongsTo(Company, { foreignKey: 'companyId' });
Company.hasMany(RecruiterProfile,   { foreignKey: 'companyId' });

// Saved jobs
SavedJob.belongsTo(Job, { foreignKey: 'jobId', as: 'Job' });
Job.hasMany(SavedJob,   { foreignKey: 'jobId' });
SavedJob.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User, Role, UserRole, Subscription, Plan, Job, Application,
  Pipeline, PipelineStage, StageHistory, Company, Bid, Invitation, Contract, SavedJob, Payment,
};
