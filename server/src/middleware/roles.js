const { errorResponse } = require('../utils/responseHandler');

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', 401, 'UNAUTHORIZED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`,
        403,
        'FORBIDDEN'
      );
    }

    next();
  };
};

const requireAdmin = requireRole('ADMIN', 'SUPER_ADMIN');
const requireSuperAdmin = requireRole('SUPER_ADMIN');

module.exports = {
  requireRole,
  requireAdmin,
  requireSuperAdmin,
};
