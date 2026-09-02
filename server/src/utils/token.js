const jwt = require('jsonwebtoken');
const { secret, expiresIn } = require('../config/jwt');

const generateToken = (payload) => {
  return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
