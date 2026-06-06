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
            title:         'Welcome to HireWire',
            subtitle:      'Job Portal & Recruitment Platform',
            bgFrom:        '#2563eb',
            bgTo:          '#3b82f6',
            btn1Text:      'Browse Jobs',
            btn1BgColor:   '#2563eb',
            btn1TextColor: '#ffffff',
            btn2Text:      'Create Account',
            btn2BgColor:   '#ffffff',
            btn2TextColor: '#2563eb',
          },
        },
        {
          id: 'home-guide', type: 'home-guide', order: 1, visible: true,
          settings: {
            guideTitle:  'Quick Start Guide',
            step1:       'Create an account as a candidate or recruiter.',
            step2:       'Complete your profile to unlock all features.',
            step3:       'Browse jobs, apply, or post openings from your dashboard.',
            bgColor:     'transparent',
            textColor:   '#111827',
            cardOpacity: '20',
          },
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
            heading: 'Join 50,000+ professionals\nalready on HireWire',
            subtext: "Whether you're looking for your next role or building a world-class team, HireWire gives you the tools to succeed.",
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
