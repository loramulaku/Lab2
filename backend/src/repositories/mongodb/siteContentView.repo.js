/**
 * Read-side repository for SiteContent (MongoDB).
 * Per project rule: ALL public reads of site content go through this repo.
 */
const SiteContentView = require('../../models/nosql/SiteContentView');

module.exports = {
  async findByKey(key) {
    return SiteContentView.findOne({ key }).lean();
  },

  async findAll() {
    return SiteContentView.find({}).sort({ key: 1 }).lean();
  },

  async upsert({ id, key, value, label, updatedAt }) {
    return SiteContentView.findOneAndUpdate(
      { _id: id },
      { $set: { key, value, label: label ?? null, updatedAt: updatedAt ?? new Date() } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    ).lean();
  },

  async deleteByKey(key) {
    return SiteContentView.findOneAndDelete({ key });
  },
};
