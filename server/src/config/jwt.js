require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'devtech_ecommerce_jwt_secret_2026',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};
