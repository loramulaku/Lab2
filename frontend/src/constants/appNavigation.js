export const HOME_PATH = '/';

export const RECRUITER_NAV = [
  { label: 'Dashboard', href: '/recruiter/dashboard' },
  { label: 'Find jobs', href: '/jobs' },
  { label: 'My jobs', href: '/recruiter/jobs' },
  { label: 'Applications', href: '/recruiter/applications' },
  { label: 'Company', href: '/recruiter/company' },
];

export const CANDIDATE_NAV = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'My applications', href: '/my-applications' },
  { label: 'Find jobs', href: '/jobs' },
  { label: 'My profile', href: '/my-profile' },
];

export const ADMIN_NAV = [
  { label: 'Admin', href: '/admin' },
  { label: 'Find jobs', href: '/jobs' },
];

export const GUEST_NAV_HOME = [
  { label: 'Find jobs', href: '/jobs' },
  { label: 'Why HireFlow', href: '/#why', anchor: true },
  { label: 'How it works', href: '/#how-it-works', anchor: true },
];

export const GUEST_NAV_DEFAULT = [
  { label: 'Home', href: '/' },
  { label: 'Find jobs', href: '/jobs' },
];

export function getPrimaryNav(roles = []) {
  if (roles.includes('recruiter')) return RECRUITER_NAV;
  if (roles.includes('candidate')) return CANDIDATE_NAV;
  if (roles.includes('admin')) return ADMIN_NAV;
  return GUEST_NAV_DEFAULT;
}

export function getGuestNav(pathname) {
  return pathname === '/' ? GUEST_NAV_HOME : GUEST_NAV_DEFAULT;
}

export function getDashboardPath(roles = []) {
  if (roles.includes('admin')) return '/admin';
  if (roles.includes('recruiter')) return '/recruiter/dashboard';
  if (roles.includes('candidate')) return '/dashboard';
  return '/';
}

export function isNavActive(pathname, href) {
  const path = href.split('#')[0] || '/';
  if (href.includes('#')) return pathname === path || (path === '/' && pathname === '/');
  if (path === '/jobs') {
    return pathname === '/jobs' || pathname.startsWith('/jobs/');
  }
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
}

/** Where to send the user after a successful login. */
export function getPostLoginRedirect(roles = [], fromPath) {
  if (fromPath && fromPath !== '/login' && fromPath !== '/register') {
    return fromPath;
  }
  return getDashboardPath(roles);
}

/** Best-effort destination for a notification row tap. */
export function getNotificationHref(notification, roles = []) {
  switch (notification?.type) {
    case 'message':
      return '/messages';
    case 'application':
      return roles.includes('recruiter') ? '/recruiter/applications' : '/my-applications';
    case 'profile':
      return roles.includes('recruiter') ? '/recruiter/company' : '/my-profile';
    default:
      return null;
  }
}
