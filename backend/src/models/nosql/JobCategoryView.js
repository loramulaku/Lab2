const mongoose = require('mongoose');

const JobCategoryViewSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    jobId: { type: Number },
    categoryId: { type: Number },
    categoryName: { type: String },
    jobTitle: { type: String },
  },
  { _id: false, timestamps: false, collection: 'job_category_views' }
);

JobCategoryViewSchema.index({ jobId: 1 });
JobCategoryViewSchema.index({ categoryId: 1 });

module.exports = mongoose.model('JobCategoryView', JobCategoryViewSchema);
