const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler'); // Or your own catchAsync utility
const AppError = require('../utils/appError');
const User = require('../models/User');
const config = require('../config');
const logger = require('../utils/logger');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Else check for token in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token || token === 'none') { // 'none' might be set on logout
    return next(new AppError('Not authorized to access this route (no token)', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Add user from payload to request object
    // We select '-password' to ensure the password hash is not attached to the req object
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
        return next(new AppError('User belonging to this token does no longer exist.', 401));
    }

    // TODO: Check if user changed password after the token was issued
    // if (req.user.changedPasswordAfter(decoded.iat)) {
    //   return next(new AppError('User recently changed password! Please log in again.', 401));
    // }

    next();
  } catch (err) {
    logger.error(`Token verification failed: ${err.message}`);
    if (err.name === 'JsonWebTokenError') {
        return next(new AppError('Not authorized to access this route (invalid token)', 401));
    }
    if (err.name === 'TokenExpiredError') {
        return next(new AppError('Not authorized to access this route (token expired)', 401));
    }
    return next(new AppError('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles
// Example: authorize('admin', 'manager')
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
        // This should ideally not happen if 'protect' middleware runs first
        return next(new AppError('User role not found, authorization denied.', 403));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`User role '${req.user.role}' is not authorized to access this route`, 403)
      );
    }
    next();
  };
};

// Middleware to check if the user is an admin
exports.isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return next(new AppError('Not authorized as an admin', 403));
    }
    next();
};
