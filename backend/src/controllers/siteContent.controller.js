/**
 * SiteContent controller — thin layer.
 * Per project rule: NO business logic here. Each method builds a Command/Query
 * and delegates to the appropriate CQRS handler.
 *
 *   • Public reads  → MongoDB (siteContentView)
 *   • Admin writes  → MySQL (SiteContent) + sync to MongoDB
 */

const UpsertSiteContentCommand    = require('../application/siteContent/commands/UpsertSiteContent.command');
const DeleteSiteContentCommand    = require('../application/siteContent/commands/DeleteSiteContent.command');
const GetSiteContentQuery         = require('../application/siteContent/queries/GetSiteContent.query');
const GetAllSiteContentQuery      = require('../application/siteContent/queries/GetAllSiteContent.query');

const upsertSiteContentHandler    = require('../application/siteContent/handlers/UpsertSiteContentHandler');
const deleteSiteContentHandler    = require('../application/siteContent/handlers/DeleteSiteContentHandler');
const getSiteContentHandler       = require('../application/siteContent/handlers/GetSiteContentHandler');
const getAllSiteContentHandler    = require('../application/siteContent/handlers/GetAllSiteContentHandler');

const SiteContentDTO = require('../dtos/siteContent.dto');

const siteContentController = {
  // ── Public (no auth) ────────────────────────────────────────────────────────
  async getAllPublic(_req, res) {
    try {
      const docs = await getAllSiteContentHandler.handle(new GetAllSiteContentQuery());
      return res.json(SiteContentDTO.fromList(docs));
    } catch (err) {
      console.error('[siteContent.getAllPublic]', err);
      return res.status(500).json({ message: 'Failed to fetch site content' });
    }
  },

  async getOnePublic(req, res) {
    try {
      const doc = await getSiteContentHandler.handle(new GetSiteContentQuery({ key: req.params.key }));
      if (!doc) return res.status(404).json({ message: 'Not found' });
      return res.json(SiteContentDTO.from(doc));
    } catch (err) {
      console.error('[siteContent.getOnePublic]', err);
      return res.status(500).json({ message: 'Failed to fetch site content' });
    }
  },

  // ── Admin (auth + isAdmin) ──────────────────────────────────────────────────
  async listAdmin(_req, res) {
    try {
      const docs = await getAllSiteContentHandler.handle(new GetAllSiteContentQuery());
      return res.json(SiteContentDTO.fromList(docs));
    } catch (err) {
      console.error('[siteContent.listAdmin]', err);
      return res.status(500).json({ message: 'Failed to fetch site content' });
    }
  },

  async upsert(req, res) {
    try {
      const { key } = req.params;
      const { value, label } = req.body;
      if (typeof value !== 'string') {
        return res.status(400).json({ message: '`value` (string) is required' });
      }
      const row = await upsertSiteContentHandler.handle(new UpsertSiteContentCommand({
        key,
        value,
        label,
        updatedBy: req.user?.id,
      }));
      return res.json({
        id:        row.id,
        key:       row.key,
        value:     row.value,
        label:     row.label,
        updatedAt: row.updatedAt,
      });
    } catch (err) {
      console.error('[siteContent.upsert]', err);
      return res.status(500).json({ message: 'Failed to save site content' });
    }
  },

  async remove(req, res) {
    try {
      await deleteSiteContentHandler.handle(new DeleteSiteContentCommand({ key: req.params.key }));
      return res.json({ message: 'Deleted' });
    } catch (err) {
      console.error('[siteContent.remove]', err);
      return res.status(500).json({ message: 'Failed to delete site content' });
    }
  },
};

module.exports = siteContentController;
