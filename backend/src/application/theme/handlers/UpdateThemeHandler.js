const themeMysqlRepo = require('../../../repositories/mysql/theme.repo');
const { syncThemeSafe } = require('../../../sync/themeSync');

class UpdateThemeHandler {
  async handle(command) {
    const { id, config } = command;
    
    let theme;
    if (id) {
      theme = await themeMysqlRepo.update(id, config);
    } else {
      theme = await themeMysqlRepo.create(config);
    }
    
    if (theme) {
      syncThemeSafe(theme.id);
    }
    
    return theme;
  }
}

module.exports = new UpdateThemeHandler();
