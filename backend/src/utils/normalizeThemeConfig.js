const { DEFAULT_THEME_CONFIG } = require('../constants/themeDefaults');

function normalizeThemeConfig(raw = {}) {
  const result = JSON.parse(JSON.stringify(DEFAULT_THEME_CONFIG));

  // Ignore saved section settings from configs that predate the current schema (_version: 3).
  // Stale DB records will fall through to defaults automatically; new saves carry _version: 3.
  if (raw._version !== 3) return result;

  if (raw.colors && typeof raw.colors === 'object') {
    result.colors = { ...result.colors, ...raw.colors };
  }

  if (raw.fonts && typeof raw.fonts === 'object') {
    result.fonts = { ...result.fonts, ...raw.fonts };
  }

  for (const [pageKey, defaultPage] of Object.entries(DEFAULT_THEME_CONFIG.pages)) {
    const rawPage = raw.pages?.[pageKey];
    const rawSections = Array.isArray(rawPage?.sections) ? rawPage.sections : [];

    result.pages[pageKey] = {
      ...defaultPage,
      label: rawPage?.label ?? defaultPage.label,
      path:  rawPage?.path  ?? defaultPage.path,
      sections: defaultPage.sections.map((defaultSection) => {
        const match = rawSections.find(
          (s) => s?.type === defaultSection.type || s?.id === defaultSection.id
        );
        if (!match) return { ...defaultSection };

        return {
          ...defaultSection,
          ...match,
          visible: match.visible ?? defaultSection.visible,
          order:   match.order   ?? defaultSection.order,
          settings: {
            ...defaultSection.settings,
            ...(match.settings && typeof match.settings === 'object' ? match.settings : {}),
          },
        };
      }),
    };
  }

  return result;
}

module.exports = { normalizeThemeConfig };
