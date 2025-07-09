const User = require('../models/User');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const logger = require('../utils/logger');

// @desc    Get all users (Admin)
// @access  Admin
exports.getAllUsers = async (queryParams) => {
  // Exclude current admin user from the list if needed, or based on a query param
  // const filter = queryParams.excludeSelf && queryParams.currentUserId ? { _id: { $ne: queryParams.currentUserId } } : {};

  const features = new APIFeatures(User.find(/*filter*/), queryParams)
    .filter() // Allow filtering by email, name, role, isActive, etc.
    .sort()   // Sort by name, email, createdAt, etc.
    .limitFields() // Select specific fields, default excludes password
    .paginate();

  const users = await features.query;
  // const totalUsers = await User.countDocuments(features.mongooseQuery.getFilter()); // If total count is needed

  return users; // { users, totalUsers (optional) }
};

// @desc    Get a single user by ID (Admin)
// @access  Admin
exports.getUserById = async (userId) => {
  const user = await User.findById(userId); // Password will be excluded by default due to `select: false` in model
  if (!user) {
    throw new AppError(`User not found with ID: ${userId}`, 404);
  }
  return user;
};

// @desc    Update user details by Admin
// @access  Admin
exports.updateUserByAdmin = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(`User not found with ID: ${userId}`, 404);
  }

  // Fields that admin can update: name, email, role, isActive
  // Password should be changed by user themselves or via password reset flow.
  // Admin should not be able to set/change password directly here for security.
  if (updateData.password || updateData.passwordConfirm) {
    throw new AppError('Admin cannot update user password directly via this route. Use password reset functionality if needed.', 400);
  }

  // If email is being changed, check for uniqueness
  if (updateData.email && updateData.email !== user.email) {
    const existingUser = await User.findOne({ email: updateData.email });
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new AppError(`Email ${updateData.email} is already taken.`, 409); // Conflict
    }
    user.email = updateData.email;
  }

  if (updateData.name) user.name = updateData.name;
  if (updateData.role) {
    // Validate role if necessary (e.g., against a predefined list of roles)
    const allowedRoles = ['user', 'admin', 'manager']; // Should match enum in User model
    if (!allowedRoles.includes(updateData.role)) {
        throw new AppError(`Invalid role: ${updateData.role}. Allowed roles are: ${allowedRoles.join(', ')}`, 400);
    }
    user.role = updateData.role;
  }
  if (typeof updateData.isActive === 'boolean') user.isActive = updateData.isActive;

  // Optional: If admin changes role or isActive status, log it specifically.
  // if (user.isModified('role') || user.isModified('isActive')) {
  //    logger.info(`Admin ${adminUserId} changed user ${userId} role to ${user.role} and isActive to ${user.isActive}`);
  // }

  const updatedUser = await user.save({ validateBeforeSave: true }); // Run Mongoose validations
  return updatedUser;
};

// @desc    Delete a user by Admin (soft delete recommended)
// @access  Admin
exports.deleteUserByAdmin = async (userId, adminPerformingActionId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(`User not found with ID: ${userId}`, 404);
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === adminPerformingActionId.toString()) {
      throw new AppError('You cannot delete your own account via this route.', 400);
  }

  // Soft delete: Set isActive to false (or add an isDeleted flag)
  // This is generally preferred over hard delete for users.
  if (user.isActive) {
    user.isActive = false;
    // Optionally, you might want to clear sensitive data or add a 'deletedAt' timestamp
    // user.email = `${user.email}_deleted_${Date.now()}`; // Example: anonymize email
    // user.name = "Deleted User";
    await user.save({ validateBeforeSave: false }); // Skip some validations if anonymizing
    logger.info(`User ${userId} soft deleted (deactivated) by admin ${adminPerformingActionId}.`);
    return { message: 'User deactivated successfully.' };
  } else {
    // If user is already inactive, perhaps hard delete if that's a requirement for "double delete"
    // For now, just indicate they are already inactive.
    // Or, proceed with hard delete:
    // await user.deleteOne();
    // logger.info(`User ${userId} hard deleted by admin ${adminPerformingActionId}.`);
    // return { message: 'User permanently deleted successfully.' };
    return { message: 'User is already inactive.' };
  }
};


// --- User Profile specific services (can be in a separate profileService.js or here) ---

// @desc    Get current user's profile (could be part of authService.getMe or here for more detail)
// exports.getMyProfile = async (userId) => {
//   const user = await User.findById(userId);
//   if (!user) throw new AppError('User not found', 404);
//   return user;
// };

// @desc    Update current user's profile (name, maybe non-critical preferences)
// exports.updateMyProfile = async (userId, updateData) => {
//   const user = await User.findById(userId);
//   if (!user) throw new AppError('User not found', 404);

//   // Fields user can update for themselves: name, (maybe email with verification step)
//   // Password update is handled by authService.updatePassword
//   // Role and isActive are admin-only changes.
//   if (updateData.email && updateData.email !== user.email) {
//     // TODO: Implement email change with verification process
//     throw new AppError('Email change requires verification. Feature not yet implemented.', 400);
//     // user.newEmail = updateData.email; // Store new email temporarily
//     // user.emailVerificationToken = user.createEmailVerificationToken(); // Generate token
//     // await user.save();
//     // Send verification email to updateData.email
//   }
//   if (updateData.name) user.name = updateData.name;
//   // Add other updatable profile fields here (e.g., preferences)

//   const updatedProfile = await user.save({ validateModifiedOnly: true });
//   return updatedProfile;
// };
