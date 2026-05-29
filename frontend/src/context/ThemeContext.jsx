import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { themeService } from '../services/themeService';
import { DEFAULT_THEME_CONFIG } from '../constants/themeDefaults';
import { normalizeThemeConfig } from '../utils/normalizeThemeConfig';

const ThemeContext = createContext(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

/**
 * usePageSection — returns the settings object for a specific section on a page.
 * Always returns an object (empty fallback) so callers can use ?? safely.
 */
export function usePageSection(pageName, sectionType) {
  const { config } = useTheme();
  const sections = config?.pages?.[pageName]?.sections;
  if (!Array.isArray(sections)) return {};
  return sections.find(s => s.type === sectionType)?.settings ?? {};
}

/** Visible sections for a page, sorted by order (used to render CMS-driven layouts). */
export function usePageSections(pageName) {
  const { config } = useTheme();
  const sections = config?.pages?.[pageName]?.sections;
  if (!Array.isArray(sections)) return [];
  return [...sections]
    .filter(s => s.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// ── CSS variable application ──────────────────────────────────────────────────

function applyThemeCSSVars(config) {
  if (!config) return;
  const root = document.documentElement;
  Object.entries(config.colors ?? {}).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  if (config.fonts?.primary) {
    root.style.setProperty('--font-primary', config.fonts.primary);
  }
}

applyThemeCSSVars(DEFAULT_THEME_CONFIG);

// ── Provider ──────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT_THEME_CONFIG);
  const receivedFromParent  = useRef(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type !== 'THEME_UPDATE') return;
      receivedFromParent.current = true;
      const normalized = normalizeThemeConfig(e.data.config ?? {});
      setConfig(normalized);
      applyThemeCSSVars(normalized);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  useEffect(() => {
    themeService.getActive()
      .then(data => {
        if (receivedFromParent.current) return;
        const normalized = normalizeThemeConfig(data.config ?? {});
        setConfig(normalized);
        applyThemeCSSVars(normalized);
      })
      .catch(() => {
        // Keep defaults — already applied synchronously above.
      });
  }, []);

  const updateTheme = (newConfig) => {
    const normalized = normalizeThemeConfig(newConfig ?? {});
    setConfig(normalized);
    applyThemeCSSVars(normalized);
  };

  return (
    <ThemeContext.Provider value={{ config, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
