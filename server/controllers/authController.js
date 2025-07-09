const User = require('../models/User');
const authService = require('../services/authService');
const AppError = require('../utils/appError'); // Assuming you'll create this utility
const catchAsync = require('../utils/catchAsync'); // Assuming you'll create this utility
const logger = require('../utils/logger');

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return next(new AppError('Please provide name, email, and password', 400));
  }

  // Basic password validation (example)
  if (password.length < 6) {
    return next(new AppError('Password must be at least 6 characters long', 400));
  }

  // Note: More robust validation (e.g., email format, password complexity) should be done
  // either here, in a validation middleware (e.g., using Zod), or in the service layer.

  const { newUser, token } = await authService.registerUser({ name, email, password, role });

  // Send cookie
  sendTokenResponse(newUser, 201, res, token, 'User registered successfully');
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return next(new AppError('Please provide an email and password', 400));
  }

  const { user, token } = await authService.loginUser(email, password);

  if (!user) {
    return next(new AppError('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res, token, 'User logged in successfully');
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = catchAsync(async (req, res, next) => {
  // req.user is set by the authMiddleware
  const user = await User.findById(req.user.id).select('-password'); // Exclude password

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private (or Public depending on how you want to handle it)
exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // expires in 10 seconds
    httpOnly: true,
    // secure: process.env.NODE_ENV === 'production', // Ensure secure is true in production
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: {},
  });
});


// Helper function to send token response
const sendTokenResponse = (user, statusCode, res, token, message) => {
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 // days to milliseconds
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true; // Send cookie only over HTTPS
    // options.sameSite = 'None'; // Required if client and server are on different domains
  }

  // Remove password from output if it's still on the user object
  const userOutput = { ...user.toObject() }; // Or user._doc if not using .toObject()
  delete userOutput.password;


  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message,
      token, // Optionally send token in response body as well
      data: userOutput,
    });
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError('Please provide an email address', 400));
  }

  // The service handles not revealing if the user exists
  // It also needs the client's origin to build the reset URL
  const clientOrigin = req.get('origin') || `${req.protocol}://${req.get('host')}`; // Fallback if origin header not present

  await authService.forgotPassword(email, clientOrigin);

  res.status(200).json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { resettoken } = req.params;
  const { password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm) {
    return next(new AppError('Please provide new password and confirmation', 400));
  }

  const { user, token } = await authService.resetPassword(resettoken, password, passwordConfirm);

  sendTokenResponse(user, 200, res, token, 'Password reset successful. You are now logged in.');
});

// @desc    Update user password (when logged in)
// @route   PUT /api/v1/auth/updatepassword
// @access  Private (user must be logged in)
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, password, passwordConfirm } = req.body;

  if (!currentPassword || !password || !passwordConfirm) {
    return next(new AppError('Please provide current password, new password, and confirmation', 400));
  }

  // req.user.id is available from the 'protect' middleware
  const { user, token } = await authService.updatePassword(
    req.user.id,
    currentPassword,
    password,
    passwordConfirm
  );

  sendTokenResponse(user, 200, res, token, 'Password updated successfully. Please use your new password for future logins.');
});


// TODO: Implement other auth controllers like:
// - verifyEmail (if implementing email verification)
// - sendVerificationEmail
// - refreshToken (optional, if implementing refresh tokens)
// - manageTwoFactorAuth (enable/disable/verify OTP)
// - adminLogin (if a separate login for admin with different checks is needed)
