const dotenv = require('dotenv');

// Load .env file contents into process.env
dotenv.config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  jwtCookieExpiresIn: process.env.JWT_COOKIE_EXPIRES_IN,
  clientURL: process.env.CLIENT_URL,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    username: process.env.EMAIL_USERNAME,
    password: process.env.EMAIL_PASSWORD,
    fromAddress: process.env.EMAIL_FROM_ADDRESS,
    fromName: process.env.EMAIL_FROM_NAME,
  },
  // Add other configurations as needed
  // For example, Redis config:
  // redis: {
  //   host: process.env.REDIS_HOST,
  //   port: process.env.REDIS_PORT,
  //   password: process.env.REDIS_PASSWORD,
  // },
  // Payment gateway config:
  // stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  // iyzico: {
  //   apiKey: process.env.IYZICO_API_KEY,
  //   secretKey: process.env.IYZICO_SECRET_KEY,
  //   baseUrl: process.env.IYZICO_BASE_URL,
  // }
};
