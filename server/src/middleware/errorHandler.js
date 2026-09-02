const { errorResponse } = require('../utils/responseHandler');

const errorHandler = (err, req, res, next) => {
  console.error('[Error Handled]:', err);

  // Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const fields = err.errors ? err.errors.map(e => e.path).join(', ') : 'field';
    return errorResponse(res, `A record with this ${fields} already exists.`, 409, 'DUPLICATE_ENTRY');
  }

  // Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors ? err.errors.map(e => e.message) : ['Validation failed'];
    return errorResponse(res, messages.join(', '), 422, 'VALIDATION_ERROR', err.errors);
  }

  // JSON Web Token Error
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid authentication token.', 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Authentication token has expired. Please log in again.', 401, 'TOKEN_EXPIRED');
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return errorResponse(res, message, statusCode, err.errorCode || 'INTERNAL_ERROR');
};

module.exports = errorHandler;
