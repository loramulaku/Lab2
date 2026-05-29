const Theme = require('../../models/sql/Theme');

const themeRepo = {
  async findActive() {
    return await Theme.findOne({ where: { isActive: true } });
  },

  async findById(id) {
    return await Theme.findByPk(id);
  },

  async create(config) {
    return await Theme.create({ config, isActive: false });
  },

  async update(id, config) {
    const theme = await Theme.findByPk(id);
    if (!theme) return null;
    theme.config = config;
    await theme.save();
    return theme;
  },

  async setActive(id) {
    await Theme.update({ isActive: false }, { where: {} });
    const theme = await Theme.findByPk(id);
    if (!theme) return null;
    theme.isActive = true;
    await theme.save();
    return theme;
  },
};

module.exports = themeRepo;
