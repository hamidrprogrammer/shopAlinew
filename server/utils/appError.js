/**
 * Custom error class for operational errors.
 * Operational errors are errors that are expected and can be handled gracefully.
 * Examples: user input validation errors, resource not found, etc.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // Call the parent constructor (Error class)

    this.statusCode = statusCode;
    // Determine status based on statusCode (fail for 4xx, error for 5xx)
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Mark this error as operational

    // Capture the stack trace, excluding the constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
