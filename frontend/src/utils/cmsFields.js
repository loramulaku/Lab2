/**
 * Visual editor field catalogue — maps each public page to its editable blocks.
 * Used by the Shopify-style theme editor in the admin dashboard.
 */

/** Factory-default copy — mirrors backend adminSeeder DEFAULT_SITE_CONTENT. */
export const CMS_DEFAULTS = {
  'home.hero.title': 'Welcome to HireFlow',
  'home.hero.subtitle': 'Job Portal & Recruitment Platform',
  'home.cta.primary': 'Login',
  'home.cta.secondary': 'Create Account',
  'home.guide.title': 'Quick Start Guide',
  'home.guide.step1': 'Register a new account or sign in.',
  'home.guide.step2': 'Recruiters can post jobs, candidates can apply.',
  'home.guide.step3': 'Admins manage everything from the dashboard.',
  'login.title': 'Welcome back',
  'login.subtitle': 'Sign in to your account',
  'login.email.label': 'Email Address',
  'login.email.placeholder': 'you@example.com',
  'login.password.label': 'Password',
  'login.password.placeholder': 'Your password',
  'login.submit': 'Sign In',
  'login.footer.prompt': "Don't have an account?",
  'login.footer.link': 'Create one',
  'auth.left.hero.title': 'Join 50,000+ professionals\nalready on HireFlow',
  'auth.left.hero.subtitle':
    "Whether you're looking for your next role or building a world-class team, HireFlow gives you the tools to succeed.",
  'auth.left.features': [
    'Free account forever',
    'AI-powered job matching',
    'Real-time pipeline tracking',
    'Integrated messaging',
    'Freelance bidding system',
  ].join('\n'),
  'auth.left.security.title': 'Secure & Private',
  'auth.left.security.text':
    'Your data is encrypted and never sold. We take privacy seriously.',
  'site.brand.name': 'HireFlow',
  'site.footer.text': '© HireFlow. All rights reserved.',
};

export const CMS_PAGES = [
  {
    id: 'home',
    title: 'Home',
    path: '/',
    description: 'Landing page visitors see first',
    groups: [
      {
        id: 'hero',
        title: 'Hero',
        fields: [
          { key: 'home.hero.title', label: 'Headline', type: 'text' },
          { key: 'home.hero.subtitle', label: 'Subtitle', type: 'text' },
        ],
      },
      {
        id: 'cta',
        title: 'Call to action',
        fields: [
          { key: 'home.cta.primary', label: 'Primary button', type: 'text' },
          { key: 'home.cta.secondary', label: 'Secondary button', type: 'text' },
        ],
      },
      {
        id: 'guide',
        title: 'Quick start guide',
        fields: [
          { key: 'home.guide.title', label: 'Section title', type: 'text' },
          { key: 'home.guide.step1', label: 'Step 1', type: 'textarea' },
          { key: 'home.guide.step2', label: 'Step 2', type: 'textarea' },
          { key: 'home.guide.step3', label: 'Step 3', type: 'textarea' },
        ],
      },
      {
        id: 'footer',
        title: 'Footer',
        fields: [
          { key: 'site.footer.text', label: 'Footer text', type: 'text' },
        ],
      },
    ],
  },
  {
    id: 'login',
    title: 'Login',
    path: '/login',
    description: 'Sign-in page with marketing panel',
    groups: [
      {
        id: 'brand',
        title: 'Brand',
        fields: [
          { key: 'site.brand.name', label: 'Brand name', type: 'text' },
        ],
      },
      {
        id: 'form',
        title: 'Sign-in form',
        fields: [
          { key: 'login.title', label: 'Heading', type: 'text' },
          { key: 'login.subtitle', label: 'Subheading', type: 'text' },
          { key: 'login.email.label', label: 'Email label', type: 'text' },
          { key: 'login.email.placeholder', label: 'Email placeholder', type: 'text' },
          { key: 'login.password.label', label: 'Password label', type: 'text' },
          { key: 'login.password.placeholder', label: 'Password placeholder', type: 'text' },
          { key: 'login.submit', label: 'Submit button', type: 'text' },
          { key: 'login.footer.prompt', label: 'Footer prompt', type: 'text' },
          { key: 'login.footer.link', label: 'Footer link text', type: 'text' },
        ],
      },
      {
        id: 'panel',
        title: 'Left marketing panel',
        fields: [
          { key: 'auth.left.hero.title', label: 'Hero headline', type: 'textarea', hint: 'Use a new line for a line break' },
          { key: 'auth.left.hero.subtitle', label: 'Hero description', type: 'textarea' },
          { key: 'auth.left.features', label: 'Feature list', type: 'textarea', hint: 'One feature per line' },
          { key: 'auth.left.security.title', label: 'Security badge title', type: 'text' },
          { key: 'auth.left.security.text', label: 'Security badge text', type: 'textarea' },
        ],
      },
    ],
  },
];

/** Factory-default text for a CMS key (empty string if unknown). */
export function getCmsDefault(key) {
  return CMS_DEFAULTS[key] ?? '';
}

/** Flat list of every key managed by the visual editor. */
export function allCmsFieldKeys() {
  return CMS_PAGES.flatMap((p) => p.groups.flatMap((g) => g.fields.map((f) => f.key)));
}

/** Find field metadata by key (for sidebar labels). */
export function findCmsField(key) {
  for (const page of CMS_PAGES) {
    for (const group of page.groups) {
      const field = group.fields.find((f) => f.key === key);
      if (field) return { ...field, pageId: page.id, groupId: group.id };
    }
  }
  return null;
}
