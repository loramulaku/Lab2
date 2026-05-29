const siteContentMysqlRepo = require('../../../repositories/mysql/siteContent.repo');
const { deleteSiteContentView } = require('../../../sync/siteContentSync');

class DeleteSiteContentHandler {
  async handle(command) {
    await siteContentMysqlRepo.deleteByKey(command.key);
    await deleteSiteContentView(command.key);
  }
}

module.exports = new DeleteSiteContentHandler();
