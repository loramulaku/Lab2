const mongoose = require('mongoose');

/**
 * PlanView — read-optimised projection of the Plans table.
 * _id = MySQL Plans.id.
 */
const PlanViewSchema = new mongoose.Schema(
  {
    _id:      { type: Number },          // MySQL Plans.id
    name:     { type: String },
    price:    { type: Number },
    jobLimit: { type: Number },
  },
  { _id: false, timestamps: false, collection: 'plan_views' }
);

module.exports = mongoose.model('PlanView', PlanViewSchema);
