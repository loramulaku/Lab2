class ThemeDTO {
  constructor(doc) {
    this.id       = doc._id ?? doc.id;
    this.isActive = doc.isActive;
    this.config   = doc.config;
  }

  static from(doc) {
    if (!doc) return null;
    return new ThemeDTO(doc);
  }
}

module.exports = ThemeDTO;
