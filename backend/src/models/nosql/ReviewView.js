const mongoose = require('mongoose');

const ReviewViewSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    reviewerId: { type: Number },
    reviewedId: { type: Number },
    rating: { type: Number },
    comment: { type: String },
    reviewerName: { type: String },
    reviewedName: { type: String },
  },
  { _id: false, timestamps: false, collection: 'review_views' }
);

ReviewViewSchema.index({ reviewedId: 1 });
ReviewViewSchema.index({ rating: 1 });

module.exports = mongoose.model('ReviewView', ReviewViewSchema);
