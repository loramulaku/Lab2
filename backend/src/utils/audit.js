const AuditLog = require('../models/sql/AuditLog');

/**
 * Fire-and-forget audit logger. Never throws — failures are logged silently.
 *
 * @param {object} req  - Express request (for userId + IP). May be a plain
 *                        object { user: { id } } when called outside HTTP context.
 * @param {object} opts
 * @param {string} opts.action    - e.g. 'USER_LOGIN'
 * @param {string} opts.entity    - e.g. 'User'
 * @param {number} [opts.entityId]
 * @param {string} [opts.oldValue]
 * @param {string} [opts.newValue]
 */
async function auditLog(req, { action, entity, entityId, oldValue, newValue } = {}) {
  try {
    const userId    = req?.user?.id ?? null;
    const forwarded = req?.headers?.['x-forwarded-for'];
    const ipAddress = forwarded
      ? forwarded.split(',')[0].trim()
      : (req?.ip ?? null);

    await AuditLog.create({
      userId,
      action,
      entity,
      entityId:  entityId  ?? null,
      oldValue:  oldValue  ?? null,
      newValue:  newValue  ?? null,
      ipAddress: ipAddress ?? null,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error('[audit] Failed to write audit log:', err.message);
  }
}

module.exports = auditLog;
