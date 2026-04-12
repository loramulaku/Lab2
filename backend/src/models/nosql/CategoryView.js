const mongoose = require('mongoose');

const CategoryViewSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    name: { type: String },
  },
  { _id: false, timestamps: false, collection: 'category_views' }
);

module.exports = mongoose.model('CategoryView', CategoryViewSchema);
