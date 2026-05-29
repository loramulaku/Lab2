class UpsertSiteContentCommand {
  constructor({ key, value, label, updatedBy }) {
    this.key       = key;
    this.value     = value;
    this.label     = label;
    this.updatedBy = updatedBy;
  }
}
module.exports = UpsertSiteContentCommand;
