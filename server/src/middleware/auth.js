const { verifyToken } = require('../utils/token');
const { User } = require('../models');
const { errorResponse } = require('../utils/responseHandler');

const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return errorResponse(res, 'Authentication required. Please log in.', 401, 'UNAUTHORIZED');
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return errorResponse(res, 'Invalid or expired authentication token.', 401, 'INVALID_TOKEN');
    }

    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) {
      return errorResponse(res, 'User account not found or deactivated.', 401, 'USER_INACTIVE');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[AuthMiddleware] Error:', error);
    return errorResponse(res, 'Authentication failed.', 401, 'AUTH_ERROR');
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        const user = await User.findByPk(decoded.id);
        if (user && user.isActive) {
          req.user = user;
        }
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  requireAuth,
  optionalAuth,
};
