const mongoose = require('mongoose');

const auditLogViewSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    userId: { type: Number },
    action: { type: String },
    entity: { type: String },
    oldValue: { type: String },
    newValue: { type: String },
    createdAt: { type: Date },
    userName: { type: String },
  },
  { _id: false, timestamps: false, collection: 'audit_log_views' }
);

auditLogViewSchema.index({ userId: 1 });
auditLogViewSchema.index({ entity: 1 });
auditLogViewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLogView', auditLogViewSchema);
