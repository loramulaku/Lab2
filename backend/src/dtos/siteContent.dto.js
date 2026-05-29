class SiteContentDTO {
  static from(doc) {
    if (!doc) return null;
    const id = doc._id ?? doc.id ?? null;
    return {
      id,
      key:       doc.key,
      value:     doc.value ?? '',
      label:     doc.label ?? null,
      updatedAt: doc.updatedAt ?? null,
    };
  }

  static fromList(docs = []) {
    return docs.map(SiteContentDTO.from);
  }
}

module.exports = SiteContentDTO;
