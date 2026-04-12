const mongoose = require('mongoose');

/**
 * PipelineStageView — read-optimised projection of the PipelineStages table.
 * _id = MySQL PipelineStages.id. Pipeline name, job id, and job title are
 * denormalised so reads never require a join.
 */
const PipelineStageViewSchema = new mongoose.Schema(
  {
    _id:          { type: Number },          // MySQL PipelineStages.id
    pipelineId:   { type: Number },
    name:         { type: String },
    orderIndex:   { type: Number },
    // ── denormalised from Pipelines → Jobs ───
    pipelineName: { type: String },
    jobId:        { type: Number },
    jobTitle:     { type: String },
  },
  { _id: false, timestamps: false, collection: 'pipeline_stage_views' }
);

PipelineStageViewSchema.index({ pipelineId: 1 });

module.exports = mongoose.model('PipelineStageView', PipelineStageViewSchema);
