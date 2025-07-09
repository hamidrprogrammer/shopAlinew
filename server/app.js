const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan'); // For HTTP request logging
const compression = require('compression'); // For response compression
const xss = require('xss-clean'); // For XSS protection
const hpp = require('hpp'); // To protect against HTTP Parameter Pollution attacks
const mongoSanitize = require('express-mongo-sanitize'); // For MongoDB query sanitization

const { errorMiddleware } = require('./middleware/errorMiddleware');
const routes = require('./routes');
const config = require('./config');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerConfig'); // Path to your swagger config

const app = express();

// --- Global Middlewares ---

// Set security HTTP headers
app.use(helmet());

// Enable CORS - Cross Origin Resource Sharing
app.use(cors({
  origin: config.clientURL || '*', // Configure for your client URL in production
  credentials: true,
}));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // Limit request body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: [
    // Add query parameters that you want to allow duplicates for
    // e.g., 'duration', 'ratingsAverage', 'ratingsQuantity', 'difficulty', 'price', 'sort', 'fields'
    // (Consider whitelisting common APIFeatures params if needed, though hpp mainly protects against overwriting single params)
  ]
}));

// Compress all responses
app.use(compression());

// Development logging (after compression to see actual response sizes if needed, or before for raw)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else if (process.env.NODE_ENV === 'production') {
  // More concise logging for production, or use Winston stream with Morgan
  app.use(morgan('combined', { stream: logger.stream })); // Assuming logger.stream is configured in logger.js
}


// --- Routes ---
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  // explorer: true, // Adds a search bar for exploring tags and operations
  // customCss: '.swagger-ui .topbar { display: none }', // Example: Hide the top bar
  // swaggerOptions: {
  //   docExpansion: 'none' // 'list' (default), 'full', 'none'
  // }
}));


app.use('/api/v1', routes); // All routes will be prefixed with /api/v1

// --- Error Handling ---
// Handle 404 errors - Route not found
app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = 'fail';
  err.statusCode = 404;
  next(err);
});

// Global error handling middleware
app.use(errorMiddleware);

module.exports = app;
