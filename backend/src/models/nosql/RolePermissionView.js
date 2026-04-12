const mongoose = require('mongoose');

const rolePermissionViewSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    roleId: { type: Number },
    permissionId: { type: Number },
    roleName: { type: String },
    permissionName: { type: String },
  },
  { _id: false, timestamps: false, collection: 'role_permission_views' }
);

rolePermissionViewSchema.index({ roleId: 1 });

module.exports = mongoose.model('RolePermissionView', rolePermissionViewSchema);
