const mongoose = require('mongoose');

/**
 * StageHistoryView — read-optimised projection of the StageHistory table.
 * _id = MySQL StageHistory.id. Changer name and applicant name are
 * denormalised so reads never require a join.
 */
const StageHistoryViewSchema = new mongoose.Schema(
  {
    _id:           { type: Number },          // MySQL StageHistory.id
    applicationId: { type: Number },
    fromStageId:   { type: Number },
    toStageId:     { type: Number },
    changedBy:     { type: Number },
    createdAt:     { type: Date },
    // ── denormalised from Users ───────────────
    changedByName: { type: String },
    applicantName: { type: String },
  },
  { _id: false, timestamps: false, collection: 'stage_history_views' }
);

StageHistoryViewSchema.index({ applicationId: 1 });
StageHistoryViewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('StageHistoryView', StageHistoryViewSchema);
