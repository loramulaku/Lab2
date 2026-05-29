/**
 * CMS section definitions — used by the admin Site Content page to group keys
 * by page/area, and by seeders/docs as the canonical key catalogue.
 */
export const SITE_CONTENT_SECTIONS = [
  {
    id: 'login',
    title: 'Login Page',
    description: 'Right-hand sign-in form (headings, labels, placeholders, buttons).',
    prefixes: ['login.'],
  },
  {
    id: 'auth',
    title: 'Auth Left Panel',
    description: 'Marketing panel shown on Login and Register (left side).',
    prefixes: ['auth.'],
  },
  {
    id: 'home',
    title: 'Home Page',
    description: 'Public landing page hero, CTAs, and quick-start guide.',
    prefixes: ['home.'],
  },
  {
    id: 'site',
    title: 'Global',
    description: 'Brand name and site-wide strings reused across pages.',
    prefixes: ['site.'],
  },
];

/** Assign each key to a section id; unmatched keys land in "other". */
export function sectionForKey(key) {
  for (const section of SITE_CONTENT_SECTIONS) {
    if (section.prefixes.some((p) => key.startsWith(p))) return section.id;
  }
  return 'other';
}
