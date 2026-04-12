const mongoose = require('mongoose');

/**
 * PipelineView — read-optimised projection of the Pipelines table.
 * _id = MySQL Pipelines.id. Job title is denormalised so reads
 * never require a join.
 */
const PipelineViewSchema = new mongoose.Schema(
  {
    _id:      { type: Number },          // MySQL Pipelines.id
    jobId:    { type: Number },
    name:     { type: String },
    // ── denormalised from Jobs ────────────────
    jobTitle: { type: String },
  },
  { _id: false, timestamps: false, collection: 'pipeline_views' }
);

PipelineViewSchema.index({ jobId: 1 });

module.exports = mongoose.model('PipelineView', PipelineViewSchema);
