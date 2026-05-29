const DEFAULT_THEME_CONFIG = {
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
            title: 'Welcome to HireFlow',
            subtitle: 'Job Portal & Recruitment Platform',
            bgFrom: '#7c3aed', bgTo: '#ec4899',
            btn1Text: 'Admin Login', btn1BgColor: '#ffffff', btn1TextColor: '#7c3aed',
            btn2Text: 'Create Account', btn2BgColor: '#6d28d9', btn2TextColor: '#ffffff',
          },
        },
        {
          id: 'home-guide', type: 'home-guide', order: 1, visible: true,
          settings: {
            guideTitle: 'Quick Start Guide',
            step1: 'Register a new account or use: admin@hireflow.com / admin123',
            step2: 'Assign admin role in MySQL Workbench (see SQL file in backend folder)',
            step3: 'Login and navigate to /admin to access the admin dashboard',
            bgColor: '#7c3aed', textColor: '#ffffff', cardOpacity: '20',
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
            heading: 'Join 50,000+ professionals\nalready on HireFlow',
            subtext: "Whether you're looking for your next role or building a world-class team, HireFlow gives you the tools to succeed.",
          },
        },
        {
          id: 'login-form', type: 'login-form', order: 1, visible: true,
          settings: {
            heading: 'Welcome back', subheading: 'Sign in to your account',
            btnText: 'Sign In', btnBgColor: '#2563eb', btnTextColor: '#ffffff', linkColor: '#2563eb',
          },
        },
      ],
    },
  },
};

module.exports = { DEFAULT_THEME_CONFIG };
