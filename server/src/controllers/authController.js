const { User, Cart, Wishlist } = require('../models');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/token');
const { cookieOptions } = require('../config/jwt');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email, and password are required.', 400, 'VALIDATION_ERROR');
    }

    if (password.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters long.', 400, 'WEAK_PASSWORD');
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'An account with this email already exists.', 409, 'EMAIL_EXISTS');
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      phone: phone || null,
      password: hashedPassword,
      role: 'CUSTOMER',
    });

    // Create user's persistent cart and wishlist
    await Cart.create({ userId: user.id });
    await Wishlist.create({ userId: user.id });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.cookie('token', token, cookieOptions);

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
    };

    return successResponse(res, { user: userData, token }, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required.', 400, 'VALIDATION_ERROR');
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return errorResponse(res, 'Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      return errorResponse(res, 'Your account has been deactivated. Please contact support.', 403, 'ACCOUNT_DEACTIVATED');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    // Ensure cart and wishlist exist
    await Cart.findOrCreate({ where: { userId: user.id } });
    await Wishlist.findOrCreate({ where: { userId: user.id } });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.cookie('token', token, cookieOptions);

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
    };

    return successResponse(res, { user: userData, token }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required.', 400, 'VALIDATION_ERROR');
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return errorResponse(res, 'Invalid admin credentials.', 401, 'INVALID_CREDENTIALS');
    }

    if (!['ADMIN', 'SUPER_ADMIN', 'SUPPORT'].includes(user.role)) {
      return errorResponse(res, 'Access denied. You do not have administrative privileges.', 403, 'FORBIDDEN');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid admin credentials.', 401, 'INVALID_CREDENTIALS');
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.cookie('token', token, cookieOptions);

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };

    return successResponse(res, { user: userData, token }, 'Admin login successful');
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    return successResponse(res, { user: userData }, 'User profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = req.user;

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
        return errorResponse(res, 'Name must be 2-100 characters', 400, 'VALIDATION_ERROR');
      }
      user.name = name.trim();
    }
    if (phone !== undefined) {
      if (phone && (typeof phone !== 'string' || phone.length > 20)) {
        return errorResponse(res, 'Invalid phone number', 400, 'VALIDATION_ERROR');
      }
      user.phone = phone || null;
    }
    if (avatar !== undefined) {
      if (avatar && typeof avatar !== 'string') {
        return errorResponse(res, 'Invalid avatar', 400, 'VALIDATION_ERROR');
      }
      // Basic URL validation – prevent XSS via javascript: URLs
      if (avatar && !/^https?:\/\/.+/.test(avatar)) {
        return errorResponse(res, 'Avatar must be a valid http(s) URL', 400, 'VALIDATION_ERROR');
      }
      user.avatar = avatar || user.avatar;
    }

    await user.save();

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
    };

    return successResponse(res, { user: userData }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  const { cookieOptions } = require('../config/jwt');
  res.clearCookie('token', cookieOptions);
  return successResponse(res, {}, 'Logged out successfully');
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 'Email address is required.', 400, 'VALIDATION_ERROR');
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Return success to prevent account enumeration
      return successResponse(res, {}, 'If that email is registered, password reset instructions have been generated.');
    }

    const resetToken = Math.random().toString(36).substring(2, 10).toUpperCase();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // SECURITY: Never expose resetToken in response – send via email in production
    // For dev, log token server-side only
    console.log(`[PasswordReset] Token for ${email}: ${resetToken} (expires in 1h)`);

    return successResponse(res, {}, 'If that email is registered, password reset instructions have been generated.');
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return errorResponse(res, 'Email, reset token, and new password are required.', 400, 'VALIDATION_ERROR');
    }
    if (newPassword.length < 6 || newPassword.length > 128) {
      return errorResponse(res, 'Password must be 6-128 characters', 400, 'WEAK_PASSWORD');
    }

    const user = await User.findOne({
      where: {
        email,
        resetPasswordToken: token,
      },
    });

    if (!user || (user.resetPasswordExpires && user.resetPasswordExpires < new Date())) {
      return errorResponse(res, 'Invalid or expired password reset token.', 400, 'INVALID_RESET_TOKEN');
    }

    user.password = await hashPassword(newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return successResponse(res, {}, 'Password has been reset successfully. You can now log in.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  getMe,
  updateProfile,
  logout,
  forgotPassword,
  resetPassword,
};
