const mongoose = require('mongoose');

const permissionViewSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    name: { type: String },
  },
  { _id: false, timestamps: false, collection: 'permission_views' }
);

module.exports = mongoose.model('PermissionView', permissionViewSchema);
