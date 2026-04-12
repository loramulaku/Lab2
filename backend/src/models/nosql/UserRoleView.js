const mongoose = require('mongoose');

const userRoleViewSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    userId: { type: Number },
    roleId: { type: Number },
    roleName: { type: String },
  },
  { _id: false, timestamps: false, collection: 'user_role_views' }
);

userRoleViewSchema.index({ userId: 1 });

module.exports = mongoose.model('UserRoleView', userRoleViewSchema);
