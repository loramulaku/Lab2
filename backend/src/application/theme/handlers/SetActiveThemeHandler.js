const themeMysqlRepo = require('../../../repositories/mysql/theme.repo');
const themeViewRepo  = require('../../../repositories/mongodb/themeView.repo');
const { syncThemeSafe } = require('../../../sync/themeSync');

class SetActiveThemeHandler {
  async handle(command) {
    const { id } = command;
    const theme = await themeMysqlRepo.setActive(id);
    if (!theme) return null;

    await themeViewRepo.deactivateAll();
    await syncThemeSafe(theme.id);

    return theme;
  }
}

module.exports = new SetActiveThemeHandler();
