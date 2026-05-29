const siteContentViewRepo = require('../../../repositories/mongodb/siteContentView.repo');

class GetAllSiteContentHandler {
  async handle(/* query */) {
    return siteContentViewRepo.findAll();
  }
}

module.exports = new GetAllSiteContentHandler();
