const mongoose = require('mongoose');

const roleViewSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    name: { type: String },
    permissions: [{ type: String }],
  },
  { _id: false, timestamps: false, collection: 'role_views' }
);

module.exports = mongoose.model('RoleView', roleViewSchema);
