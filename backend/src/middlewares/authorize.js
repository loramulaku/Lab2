/**
 * Role-based authorization middleware.
 * Must be used after `auth` (authenticate), which populates req.user.
 *
 * Usage:
 *   router.get('/admin/stuff', auth, authorize('admin'), handler)
 *   router.get('/my-profile', auth, authorize('candidate', 'admin'), handler)
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    const userRoles = req.user?.roles ?? [];
    const permitted = allowedRoles.some(r => userRoles.includes(r));
    if (!permitted) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

module.exports = authorize;
