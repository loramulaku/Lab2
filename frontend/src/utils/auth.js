/** Role priority for post-login redirects (highest first). */
const ROLE_HOME = [
  ['admin', '/admin'],
  ['recruiter', '/recruiter/company'],
  ['candidate', '/my-profile'],
];

export const ROLES = ROLE_HOME.map(([role]) => role);

/** Pick the highest-priority role (matches JWT `role` claim). */
export function resolvePrimaryRole(roles = []) {
  for (const [role] of ROLE_HOME) {
    if (roles.includes(role)) return role;
  }
  return null;
}

/** Pick the correct landing route for a user's roles. */
export function resolveRoleHome(roles = []) {
  for (const [role, path] of ROLE_HOME) {
    if (roles.includes(role)) return path;
  }
  return '/';
}

export function hasAnyRole(userOrRoles, required = []) {
  if (!required.length) return true;
  const roles = Array.isArray(userOrRoles) ? userOrRoles : userOrRoles?.roles ?? [];
  return required.some((role) => roles.includes(role));
}

/** Decode JWT claims without verifying signature (client-side routing only). */
export function getTokenClaims(token) {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

/** Roles embedded in the access token — source of truth for route guards. */
export function getTokenRoles(token) {
  const claims = getTokenClaims(token);
  if (!claims) return [];
  if (Array.isArray(claims.roles) && claims.roles.length) return claims.roles;
  if (claims.role && ROLES.includes(claims.role)) return [claims.role];
  return [];
}

/** Returns true if a JWT string exists and hasn't expired (10 s buffer). */
export function isTokenValid(t) {
  if (!t) return false;
  try {
    const { exp } = JSON.parse(atob(t.split('.')[1]));
    return exp * 1000 > Date.now() + 10_000;
  } catch {
    return false;
  }
}
