/** Canonical role names used across JWT payloads and route guards. */
const ROLE_PRIORITY = ['admin', 'recruiter', 'candidate'];

/** Pick the highest-priority role for a user (used in JWT `role` claim). */
function resolvePrimaryRole(roles = []) {
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) return role;
  }
  return null;
}

/** Standard access-token payload — always includes both `roles` and primary `role`. */
function buildAccessPayload({ id, email, roles }) {
  const normalized = Array.isArray(roles) ? roles : [];
  return {
    id,
    email: email ?? null,
    roles: normalized,
    role: resolvePrimaryRole(normalized),
  };
}

module.exports = { ROLE_PRIORITY, resolvePrimaryRole, buildAccessPayload };
