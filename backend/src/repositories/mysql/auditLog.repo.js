const AuditLog = require('../../models/sql/AuditLog');
const createMysqlRepo = require('./_factory');
module.exports = createMysqlRepo(AuditLog);
