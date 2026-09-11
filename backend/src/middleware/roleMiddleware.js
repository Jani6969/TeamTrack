/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * Factory function that accepts allowed roles and returns a middleware.
 * Verifies that the authenticated user (from req.user) has one of the allowed roles.
 * Never trusts role claims from the client - checks server-verified req.user.
 * 
 * Example usage:
 *   router.get('/dashboard', authMiddleware, requireRole('MANAGER'), getDashboard);
 * 
 * @param {...string} roles - Allowed role names (e.g. 'MANAGER', 'TEAM_MEMBER')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of the following roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = {
  requireRole
};
