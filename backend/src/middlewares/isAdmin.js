/**
 * Middleware to check if the authenticated user has admin role.
 * Must be used after auth middleware.
 */
function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const roles = req.user.roles || [];
  const hasAdminRole = roles.some(role => role.toLowerCase() === 'admin');

  if (!hasAdminRole) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
}

module.exports = isAdmin;
