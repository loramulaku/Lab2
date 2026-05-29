const siteContentMysqlRepo = require('../../../repositories/mysql/siteContent.repo');
const { syncSiteContent } = require('../../../sync/siteContentSync');

class UpsertSiteContentHandler {
  async handle(command) {
    const row = await siteContentMysqlRepo.upsertByKey({
      key:       command.key,
      value:     command.value,
      label:     command.label,
      updatedBy: command.updatedBy,
    });
    // Await sync so the MongoDB read projection is fresh before the API responds.
    await syncSiteContent(row.id);
    return row;
  }
}

module.exports = new UpsertSiteContentHandler();
