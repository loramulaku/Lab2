const siteContentViewRepo = require('../../../repositories/mongodb/siteContentView.repo');

class GetSiteContentHandler {
  async handle(query) {
    return siteContentViewRepo.findByKey(query.key);
  }
}

module.exports = new GetSiteContentHandler();
