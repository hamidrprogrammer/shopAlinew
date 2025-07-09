const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AppError = require('../utils/appError');
const config = require('../config');
const logger = require('../utils/logger');
const emailService = require('./emailService');

// Function to sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

exports.registerUser = async (userData) => {
  const { name, email, password, role } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User with this email already exists', 409); // 409 Conflict
  }

  // Create new user
  // The role will default to 'user' if not provided, as per the schema.
  // Be careful about allowing arbitrary role assignment on registration.
  // It might be better to set role to 'user' by default and have an admin change it later.
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm: password, // Assuming passwordConfirm is used for validation in the model
    role: role || 'user', // Explicitly set role, or ensure model handles default
  });

  // Generate token
  const token = signToken(newUser._id);

  // TODO: Send welcome email (optional)
  // try {
  //   await emailService.sendWelcomeEmail(newUser.email, newUser.name);
  // } catch (emailError) {
  //   logger.error(`Failed to send welcome email to ${newUser.email}: ${emailError.message}`);
  //   // Do not fail registration if email fails, but log it.
  // }

  // newUser.password will be undefined due to `select: false` in schema, which is good.
  // If you need to return the user object, ensure password is not on it.
  // The controller's sendTokenResponse should handle removing password if it's somehow there.
  return { newUser, token };
};

exports.loginUser = async (email, password) => {
  // 1) Check if email and password exist
  if (!email || !password) {
    throw new AppError('Please provide email and password!', 400);
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password'); // Need to explicitly select password

  if (!user || !(await user.correctPassword(password, user.password))) {
    // TODO: Implement login attempt tracking and account locking if desired
    // For example, increment a loginAttempts field on the user model.
    // If attempts exceed a threshold, set accountLockedUntil.
    throw new AppError('Incorrect email or password', 401); // Unauthorized
  }

  // 3) If user is not active (e.g. soft deleted or banned)
  if (!user.isActive) {
      throw new AppError('This account has been deactivated. Please contact support.', 403); // Forbidden
  }

  // 4) If everything ok, send token to client
  const token = signToken(user._id);

  // TODO: Update lastLogin timestamp (optional)
  // user.lastLogin = Date.now();
  // user.loginAttempts = 0; // Reset login attempts on successful login
  // await user.save({ validateBeforeSave: false }); // Save without running full validations

  // The user object fetched here includes the password.
  // Ensure it's stripped before sending back in the controller.
  return { user, token };
};

exports.forgotPassword = async (email, clientOrigin) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email });
  if (!user) {
    // We don't want to reveal if a user exists or not for security reasons
    // So, we pretend the email was sent even if the user doesn't exist.
    // Log this attempt for monitoring.
    logger.warn(`Password reset attempt for non-existent user: ${email}`);
    return; // Important: Do not throw an error that reveals user existence.
  }
  if (!user.isActive) {
    logger.warn(`Password reset attempt for inactive user: ${email}`);
    return; // Do not proceed for inactive users
  }

  // 2) Generate the random reset token (this method is on the user model)
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // Save the user with the new reset token and expiry

  // 3) Send it to user's email
  try {
    // clientOrigin is needed to construct the full reset URL (e.g., http://localhost:3000 or https://yourshop.com)
    await emailService.sendPasswordResetEmail(user.email, resetToken, clientOrigin);
    logger.info(`Password reset email sent successfully to ${user.email}`);
  } catch (err) {
    logger.error(`Failed to send password reset email to ${user.email}: ${err.message}`);
    // If email sending fails, we should invalidate the token to prevent it from being used
    // if the user somehow gets it without the email.
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError('There was an error sending the email. Please try again later.', 500); // Internal Server Error
  }
};

exports.resetPassword = async (resetToken, newPassword, newPasswordConfirm) => {
  // 1) Get user based on the token
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // Check if token is not expired
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    throw new AppError('Token is invalid or has expired', 400); // Bad Request
  }
  if (!user.isActive) {
      throw new AppError('This account is inactive and cannot be reset.', 403);
  }

  if (newPassword !== newPasswordConfirm) {
    throw new AppError('Passwords do not match', 400);
  }
  // Basic password validation (can be enhanced with Zod or validator.js in controller/middleware)
  if (newPassword.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400);
  }


  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm; // This will be validated by the model's pre-save hook
  user.passwordResetToken = undefined; // Clear the token
  user.passwordResetExpires = undefined; // Clear the expiry
  // The pre-save hook for `passwordChangedAt` will also run.
  await user.save(); // This will trigger the pre-save hooks for hashing password and setting passwordChangedAt

  // 3) Log the user in, send JWT (optional, but good UX)
  const token = signToken(user._id);

  logger.info(`Password for user ${user.email} has been reset successfully.`);
  return { user, token };
};

exports.updatePassword = async (userId, currentPassword, newPassword, newPasswordConfirm) => {
  // 1) Get user from collection (need password to compare)
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError('User not found', 404); // Should not happen if user is logged in
  }
  if (!user.isActive) {
      throw new AppError('This account is inactive.', 403);
  }

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(currentPassword, user.password))) {
    throw new AppError('Your current password is incorrect', 401); // Unauthorized
  }

  // 3) If so, update password
  if (newPassword !== newPasswordConfirm) {
    throw new AppError('New passwords do not match', 400);
  }
   // Basic password validation
  if (newPassword.length < 6) {
      throw new AppError('New password must be at least 6 characters long', 400);
  }


  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm; // For validation in pre-save hook
  // The pre-save hook for `passwordChangedAt` will also run.
  await user.save(); // This will trigger the pre-save hooks

  // 4) Log user in, send new JWT (as passwordChangedAt invalidates old tokens)
  const token = signToken(user._id);

  logger.info(`Password for user ${user.email} updated successfully.`);
  return { user, token }; // Return user (without password) and new token
};


// TODO: Implement other auth services as needed:
// - verifyUserEmail (send verification email, verify token)
// - handleTwoFactorAuthSetup
// - handleTwoFactorAuthVerification
// - etc.
