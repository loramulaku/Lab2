const ThemeView = require('../../models/nosql/ThemeView');

const themeViewRepo = {
  async findActive() {
    return await ThemeView.findOne({ isActive: true });
  },

  async upsert(themeData) {
    return await ThemeView.findOneAndUpdate(
      { _id: themeData.id },
      {
        _id: themeData.id,
        isActive: themeData.isActive,
        config: themeData.config,
        createdAt: themeData.createdAt,
        updatedAt: themeData.updatedAt,
      },
      { upsert: true, new: true }
    );
  },

  async deactivateAll() {
    return await ThemeView.updateMany({}, { isActive: false });
  },

  async deleteById(id) {
    return await ThemeView.deleteOne({ _id: id });
  },
};

module.exports = themeViewRepo;
