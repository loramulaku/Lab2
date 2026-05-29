/**
 * Write-side repository for SiteContent (MySQL).
 * Per project rule: NEVER read application data through this repo from the
 * public API — reads are served by the MongoDB siteContentView repo. This
 * file's `findByKey` is used only by the sync job to project state into
 * MongoDB after a write.
 */
const SiteContent = require('../../models/sql/SiteContent');
const createMysqlRepo = require('./_factory');

const base = createMysqlRepo(SiteContent);

module.exports = {
  ...base,

  async findByKey(key) {
    return SiteContent.findOne({ where: { key } });
  },

  async upsertByKey({ key, value, label, updatedBy }) {
    const existing = await SiteContent.findOne({ where: { key } });
    if (existing) {
      await existing.update({
        value,
        ...(label !== undefined ? { label } : {}),
        updatedBy: updatedBy ?? existing.updatedBy,
      });
      return existing;
    }
    return SiteContent.create({ key, value, label: label ?? null, updatedBy: updatedBy ?? null });
  },

  async deleteByKey(key) {
    return SiteContent.destroy({ where: { key } });
  },

  async findAllRows() {
    return SiteContent.findAll({ order: [['key', 'ASC']] });
  },
};
