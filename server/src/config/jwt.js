require('dotenv').config();

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be set in production environment');
}

module.exports = {
  secret: process.env.JWT_SECRET || 'devtech_ecommerce_dev_secret_only',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};
