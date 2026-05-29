import { DEFAULT_THEME_CONFIG } from '../constants/themeDefaults';

/**
 * Merges a saved/raw theme config onto DEFAULT_THEME_CONFIG without corrupting
 * array fields (deepMerge was turning sections[] into plain objects).
 */
export function normalizeThemeConfig(raw = {}) {
  const result = structuredClone(DEFAULT_THEME_CONFIG);

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
