const AuditLogView = require('../../models/nosql/AuditLogView');
const createMongoRepo = require('./_factory');
module.exports = createMongoRepo(AuditLogView);
