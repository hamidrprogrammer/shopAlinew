/**
 * A simple asyncHandler utility to wrap async route handlers.
 * This is an alternative to `catchAsync` if you prefer this naming or structure.
 * It ensures that any promise rejections are passed to the `next` error handling middleware.
 *
 * @param {Function} fn - The asynchronous route handler function.
 * @returns {Function} - A new function that handles promise rejections.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;

// Usage:
// const userController = require('../controllers/userController');
// router.get('/', asyncHandler(userController.getAllUsers));
//
// In your controller:
// exports.getAllUsers = async (req, res, next) => {
//   const users = await User.find();
//   // ... some logic
//   if (!users) {
//     return next(new AppError('No users found', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     data: {
//       users,
//     },
//   });
// };
