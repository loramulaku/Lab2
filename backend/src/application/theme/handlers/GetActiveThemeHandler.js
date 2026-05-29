const themeViewRepo = require('../../../repositories/mongodb/themeView.repo');

class GetActiveThemeHandler {
  async handle(_query) {
    return await themeViewRepo.findActive();
  }
}

module.exports = new GetActiveThemeHandler();
