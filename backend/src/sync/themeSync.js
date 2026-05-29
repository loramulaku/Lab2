const themeMysqlRepo = require('../repositories/mysql/theme.repo');
const themeViewRepo = require('../repositories/mongodb/themeView.repo');

async function syncThemeSafe(themeId) {
  try {
    const theme = await themeMysqlRepo.findById(themeId);
    if (!theme) {
      await themeViewRepo.deleteById(themeId);
      return;
    }
    await themeViewRepo.upsert({
      id: theme.id,
      isActive: theme.isActive,
      config: theme.config,
      createdAt: theme.createdAt,
      updatedAt: theme.updatedAt,
    });
  } catch (err) {
    console.error('[themeSync] error syncing theme', themeId, err.message);
  }
}

module.exports = { syncThemeSafe };
