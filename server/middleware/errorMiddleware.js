const AppError = require('../utils/appError');
const logger = require('../utils/logger');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // Extract value from error message (regex or string manipulation)
  let value = "Unknown";
  if (err.errmsg && err.errmsg.match(/(["'])(\\?.)*?\1/)) {
    value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  } else if (err.keyValue) {
    // For newer MongoDB versions, keyValue might be available
    value = Object.values(err.keyValue).join(', ');
  }

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // B) RENDERED WEBSITE (if you had one on the server, not applicable here)
  // console.error('ERROR 💥', err);
  // return res.status(err.statusCode).render('error', { // Example
  //   title: 'Something went wrong!',
  //   msg: err.message
  // });
  logger.error('ERROR 💥', err);
   return res.status(err.statusCode).json({ // Fallback for non-API if not handled
      status: err.status,
      message: err.message,
    });
};

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // Programming or other unknown error: don't leak error details
    // 1) Log error
    logger.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  // B) RENDERED WEBSITE (if applicable)
  // Operational, trusted error: send message to client
  // if (err.isOperational) {
  //   return res.status(err.statusCode).render('error', { // Example
  //     title: 'Something went wrong!',
  //     msg: err.message
  //   });
  // }
  // Programming or other unknown error: don't leak error details
  // 1) Log error
  logger.error('ERROR 💥', err);
  // 2) Send generic message
  // return res.status(err.statusCode).render('error', { // Example
  //   title: 'Something went wrong!',
  //   msg: 'Please try again later.'
  // });
   return res.status(500).json({ // Fallback for non-API if not handled
      status: 'error',
      message: 'Something went very wrong on the server!',
    });
};


const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message; // Ensure message is copied

    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error); // MongoDB duplicate key
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error); // Mongoose validation
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    // Add more specific error handlers here if needed
    // e.g., for Zod validation errors if they reach here

    sendErrorProd(error, req, res);
  } else {
    // Fallback for other environments or if NODE_ENV is not set
    logger.error('ERROR (Unknown ENV) 💥', err);
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
};

// Simple asyncHandler utility if you don't have one yet
// (You might want to put this in a separate utils/asyncHandler.js file)
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);


module.exports = { errorMiddleware, asyncHandler };
