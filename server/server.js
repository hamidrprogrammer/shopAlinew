const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './.env' });

const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

// --- Uncaught Exception Handler ---
// Should be at the top, before any other code
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(`${err.name}: ${err.message}`);
  logger.error(err.stack);
  process.exit(1); // 1 for unhandled rejection
});

// --- Database Connection ---
connectDB();

// --- Start Server ---
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// --- Unhandled Rejection Handler ---
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(`${err.name}: ${err.message}`);
  logger.error(err.stack);
  server.close(() => {
    process.exit(1); // 1 for unhandled rejection
  });
});

// --- SIGTERM Handler (for graceful shutdown, e.g., by Docker) ---
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('💥 Process terminated!');
    // mongoose.connection.close(false, () => {
    //   logger.info('Mongoose connection closed.');
    //   process.exit(0);
    // });
  });
});
