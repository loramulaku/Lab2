const mongoose = require('mongoose');

const fileViewSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    userId: { type: Number },
    fileUrl: { type: String },
    fileType: { type: String },
    createdAt: { type: Date },
    uploaderName: { type: String },
  },
  { _id: false, timestamps: false, collection: 'file_views' }
);

fileViewSchema.index({ userId: 1 });

module.exports = mongoose.model('FileView', fileViewSchema);
