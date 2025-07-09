const winston = require('winston');
const path = require('path');

// Determine log directory (optional, can log to console only)
// const logDir = 'logs'; // Or path.join(__dirname, '../logs');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.printf(info => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message} ${info.stack ? `\n${info.stack}` : ''}`)
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message} ${info.stack ? `\n${info.stack}` : ''}`)
);

const transports = [
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug', // More verbose in dev
  }),
  // Optional: File transport for errors
  // new winston.transports.File({
  //   filename: path.join(logDir, 'error.log'),
  //   level: 'error',
  //   format: logFormat,
  //   maxsize: 5242880, // 5MB
  //   maxFiles: 5,
  // }),
  // Optional: File transport for all logs
  // new winston.transports.File({
  //   filename: path.join(logDir, 'combined.log'),
  //   level: 'info', // Or 'debug'
  //   format: logFormat,
  //   maxsize: 5242880, // 5MB
  //   maxFiles: 5,
  // }),
];

const logger = winston.createLogger({
  format: logFormat, // Default format for transports that don't specify one
  transports,
  exitOnError: false, // Do not exit on handled exceptions
});

// Stream for Morgan (HTTP request logger)
// Morgan can write to this stream, which Winston will then handle.
logger.stream = {
  write: (message) => {
    // Morgan typically adds a newline, remove it for cleaner logs if needed
    logger.info(message.substring(0, message.lastIndexOf('\n')));
  },
};

// Example of how to use the logger:
// logger.error('This is an error message.');
// logger.warn('This is a warning message.');
// logger.info('This is an info message.');
// logger.http('This is an HTTP message (if level enabled).');
// logger.verbose('This is a verbose message (if level enabled).');
// logger.debug('This is a debug message.');
// logger.silly('This is a silly message (if level enabled).');

module.exports = logger;
