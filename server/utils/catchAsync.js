/**
 * Wraps an asynchronous route handler or controller function to catch any errors
 * and pass them to the next error-handling middleware.
 * This avoids repetitive try-catch blocks in every async controller.
 *
 * @param {Function} fn - The asynchronous function to wrap.
 * @returns {Function} A new function that handles errors.
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // Errors caught here are passed to Express's error handling
  };
};

module.exports = catchAsync;

// How to use:
// const someAsyncController = catchAsync(async (req, res, next) => {
//   // Your async code here
//   const data = await someAsyncOperation();
//   res.status(200).json({
//     status: 'success',
//     data
//   });
// });
