const userService = require('../services/userService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// @desc    Get all users (Admin)
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getAllUsers = catchAsync(async (req, res, next) => {
  // req.query can include currentUserId if we want to exclude self, handled in service if needed
  const users = await userService.getAllUsers(req.query);

  res.status(200).json({
    status: 'success',
    results: users.length, // This is current page length. Total count might be needed from service.
    data: {
      users,
    },
  });
});

// @desc    Get a single user by ID (Admin)
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
exports.getUserById = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const user = await userService.getUserById(userId);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// @desc    Update user details by Admin (role, isActive, name, email)
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
exports.updateUserByAdmin = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const updateData = req.body; // { name, email, role, isActive }

  if (Object.keys(updateData).length === 0) {
    return next(new AppError('No data provided for update.', 400));
  }

  // Prevent admin from updating their own role/isActive status via this generic route
  // They should use their profile or a dedicated mechanism if allowed.
  // Or, this check could be in the service layer.
  if (req.user.id === userId && (updateData.role || typeof updateData.isActive !== 'undefined')) {
      if (updateData.role && updateData.role !== req.user.role) {
        return next(new AppError('Admin cannot change their own role via this route.', 403));
      }
      // Allowing admin to deactivate self might be problematic, depends on policy.
      // if (typeof updateData.isActive === 'boolean' && updateData.isActive === false) {
      //   return next(new AppError('Admin cannot deactivate their own account via this general update route.', 403));
      // }
  }

  const updatedUser = await userService.updateUserByAdmin(userId, updateData);

  logger.info(`User ${userId} updated by admin ${req.user.id}. New data: ${JSON.stringify(updateData)}`);
  res.status(200).json({
    status: 'success',
    message: 'User updated successfully',
    data: {
      user: updatedUser,
    },
  });
});

// @desc    Delete a user by Admin (soft delete)
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
exports.deleteUserByAdmin = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const adminPerformingActionId = req.user.id; // ID of the admin making the request

  const result = await userService.deleteUserByAdmin(userId, adminPerformingActionId);

  // userService.deleteUserByAdmin now returns a message, e.g. 'User deactivated' or 'User already inactive'
  logger.info(`Admin ${adminPerformingActionId} attempted to delete user ${userId}. Result: ${result.message}`);
  if (result.message.includes('deactivated') || result.message.includes('deleted')) {
    res.status(200).json({ // Or 204 if no content is preferred for "successful" deactivation
        status: 'success',
        message: result.message,
        data: null
    });
  } else {
     // e.g. "User is already inactive" or other messages
     res.status(200).json({
        status: 'success', // Still a success in terms of API call, but operation might be a no-op
        message: result.message,
        data: null
    });
  }
});
