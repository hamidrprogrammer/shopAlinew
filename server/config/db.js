const mongoose = require('mongoose');
const logger = require('../utils/logger'); // Assuming you have a logger utility
const config = require('./index'); // To access other config values if needed

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true); // Or false, depending on your preference for Mongoose 7 behavior

    let dbUri = process.env.MONGO_URI;
    if (process.env.NODE_ENV === 'test') {
      // For tests, @shelf/jest-mongodb sets MONGO_URL.
      // Or you might have a specific test URI in your .env.test or jest setup.
      dbUri = process.env.MONGO_URL || process.env.MONGO_URI_TEST || dbUri;
      if (!dbUri && !mongoose.connection.readyState) { // Check readyState to avoid error if already connected by test setup
        logger.error('Test environment: MONGO_URL or MONGO_URI_TEST is not set. MongoDB connection for tests might fail or use default URI.');
        // Fallback to default MONGO_URI if others are not set, though this is not ideal for isolated tests.
        // It's better to ensure MONGO_URL is set by the test preset.
      }
    }
    if (!dbUri && !mongoose.connection.readyState) {
        logger.error('MongoDB URI is not defined. Please set MONGO_URI in your environment variables.');
        process.exit(1);
    }

    // Avoid reconnecting if already connected (e.g., by test setup)
    if (mongoose.connection.readyState === 0) { // 0 = disconnected
        const conn = await mongoose.connect(dbUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          // serverSelectionTimeoutMS: process.env.NODE_ENV === 'test' ? 30000 : 5000, // Higher timeout for test DB server startup
        });
        logger.info(`MongoDB Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);
    } else {
        logger.info(`MongoDB already connected. Current host: ${mongoose.connection.host} (DB: ${mongoose.connection.name})`);
    }

  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
      // useFindAndModify: false, // Not needed in Mongoose 6+
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
