/**
 * Role-based access control middleware.
 * Usage: router.post('/jobs', auth, role('recruiter', 'admin'), handler)
 *
 * @param {...string} allowedRoles
 */
function role(...allowedRoles) {
  return (req, res, next) => {
    const userRoles = req.user?.roles ?? [];
    const hasRole = allowedRoles.some(r => userRoles.includes(r));
    if (!hasRole) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

module.exports = role;
