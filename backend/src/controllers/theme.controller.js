const UpdateThemeCommand    = require('../application/theme/commands/UpdateTheme.command');
const SetActiveThemeCommand = require('../application/theme/commands/SetActiveTheme.command');
const GetActiveThemeQuery   = require('../application/theme/queries/GetActiveTheme.query');
const updateThemeHandler    = require('../application/theme/handlers/UpdateThemeHandler');
const setActiveThemeHandler = require('../application/theme/handlers/SetActiveThemeHandler');
const getActiveThemeHandler = require('../application/theme/handlers/GetActiveThemeHandler');
const ThemeDTO              = require('../dtos/theme.dto');
const { DEFAULT_THEME_CONFIG } = require('../constants/themeDefaults');
const { normalizeThemeConfig } = require('../utils/normalizeThemeConfig');

const themeController = {
  async getActive(req, res) {
    const theme = await getActiveThemeHandler.handle(new GetActiveThemeQuery());
    if (theme) {
      const dto = ThemeDTO.from(theme);
      dto.config = normalizeThemeConfig(dto.config);
      return res.json(dto);
    }
    return res.json({ id: null, isActive: false, config: DEFAULT_THEME_CONFIG });
  },

  async update(req, res) {
    const id    = req.params.id ? Number(req.params.id) : null;
    const theme = await updateThemeHandler.handle(new UpdateThemeCommand(id, req.body));
    return res.json(ThemeDTO.from(theme));
  },

  async setActive(req, res) {
    const theme = await setActiveThemeHandler.handle(new SetActiveThemeCommand(Number(req.params.id)));
    if (!theme) return res.status(404).json({ message: 'Theme not found' });
    return res.json(ThemeDTO.from(theme));
  },
};

module.exports = themeController;
