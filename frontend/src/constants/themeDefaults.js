/**
 * DEFAULT_THEME_CONFIG
 *
 * `colors` / `fonts` — global CSS variable tokens applied by ThemeContext.
 * `pages`            — per-page section configs that real components read at runtime.
 */
export const DEFAULT_THEME_CONFIG = {
  colors: {
    primary:    '#2563eb',
    secondary:  '#64748b',
    success:    '#10b981',
    danger:     '#ef4444',
    warning:    '#f59e0b',
    background: '#ffffff',
    surface:    '#f9fafb',
    text:       '#111827',
    textMuted:  '#6b7280',
    border:     '#e5e7eb',
  },
  fonts: {
    primary: 'Inter, system-ui, sans-serif',
  },

  pages: {
    home: {
      label: 'Home Page',
      path:  '/',
      sections: [
        {
          id: 'home-hero', type: 'home-hero', order: 0, visible: true,
          settings: {
            title:   'Find Your Next\nBig Opportunity',
            subtitle: 'HireWire connects ambitious candidates with companies that are building the future. Browse thousands of jobs or post your next role today.',
            bgFrom:  '#2563eb',
            bgTo:    '#3b82f6',
            btn1Text: 'Browse Jobs',
            btn2Text: 'Create Account',
          },
        },
        {
          id: 'home-stats', type: 'home-stats', order: 1, visible: true,
          settings: {},
        },
        {
          id: 'home-about', type: 'home-about', order: 2, visible: true,
          settings: {},
        },
        {
          id: 'home-categories', type: 'home-categories', order: 3, visible: true,
          settings: {},
        },
        {
          id: 'home-guide', type: 'home-guide', order: 4, visible: true,
          settings: {
            guideTitle: 'From zero to hired.',
            guideSub:   "Here's exactly how it works — no surprises, no fine print.",
          },
        },
        {
          id: 'home-cta', type: 'home-cta', order: 5, visible: true,
          settings: {},
        },
      ],
    },

    login: {
      label: 'Login Page',
      path:  '/login',
      sections: [
        {
          id: 'login-left', type: 'login-left', order: 0, visible: true,
          settings: {
            bgColor: '#2B3FE7',
            heading: 'Find work.\nHire better.\nAll in one place.',
            subtext: 'Browse listings, apply with one click, post roles, and manage your entire hiring pipeline — all from a single account.',
          },
        },
        {
          id: 'login-form', type: 'login-form', order: 1, visible: true,
          settings: {
            heading:      'Welcome back',
            subheading:   'Sign in to your account',
            btnText:      'Sign In',
            btnBgColor:   '#2563eb',
            btnTextColor: '#ffffff',
            linkColor:    '#2563eb',
          },
        },
      ],
    },
  },
};
