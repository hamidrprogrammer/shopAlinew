const mongoose = require('./node_modules/mongoose'); // Assuming __dirname is rootDir
// const { MongoMemoryServer } = require('mongodb-memory-server'); // Not needed if using @shelf/jest-mongodb preset

// Increase timeout for potentially long DB operations or server startup
jest.setTimeout(30000); // 30 seconds

let mongoUriFromEnv;

beforeAll(async () => {
  // MONGO_URI_TEST is set by globalSetup.js
  mongoUriFromEnv = process.env.MONGO_URI_TEST;

  if (!mongoUriFromEnv) {
    console.error('MONGO_URI_TEST not set. Ensure globalSetup.js ran successfully and set the environment variable.');
    // This indicates a problem with the globalSetup or Jest's environment variable propagation.
    process.exit(1); // Critical error, tests cannot run without DB URI
  }

  try {
    // Ensure Mongoose is not already connected (e.g. from a previous test run if Jest didn't exit cleanly)
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    await mongoose.connect(mongoUriFromEnv, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // serverSelectionTimeoutMS: 20000, // Increased timeout for CI environments
    });
    // console.log(`Successfully connected to MongoDB In-Memory for tests: ${mongoUriFromEnv}`);
  } catch (err) {
    console.error(`Failed to connect to MongoDB In-Memory for tests using URI ${mongoUriFromEnv}:`, err);
    process.exit(1);
  }
});

// Runs before each test file (or each test if configured differently)
// Clear all data before each test to ensure test isolation
// beforeEach(async () => {
//   const collections = mongoose.connection.collections;
//   for (const key in collections) {
//     const collection = collections[key];
//     await collection.deleteMany({});
//   }
// });

// A more robust way to clear data, especially with potential parallel tests or complex schemas:
// This will run before each test suite (each .test.js file)
// For clearing before each individual test, use beforeEach inside the test file or configure Jest differently.
// For now, clearing before each test suite (file) is a good start.
// If your tests within a single file depend on each other's data, this is fine.
// If they need to be fully isolated, use beforeEach within the test file.
// For @shelf/jest-mongodb, it often handles DB cleaning per test file if `dropCollection` is used.
// Let's add a helper to clear all collections, can be called in test files if needed.
global.clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    try {
      await collection.deleteMany({});
    } catch (error) {
      // This can happen if a collection is dropped and recreated rapidly, or other edge cases.
      // console.warn(`Warning: Could not clear collection ${key}: ${error.message}`);
      // If it's a system collection (like system.indexes), skip it.
      if (error.message.includes('system.indexes')) continue;
      // For other errors, you might want to log or handle differently.
    }
  }
};


// Runs after all tests have completed
afterAll(async () => {
  await mongoose.disconnect();
  // The @shelf/jest-mongodb preset should automatically stop the in-memory MongoDB server.
  // If you started mongod manually (global.__MONGOD__):
  // if (global.__MONGOD__) {
  //   await global.__MONGOD__.stop();
  // }
  // console.log('Disconnected from MongoDB In-Memory for tests.');
});

// You can also expose your Express app here for supertest,
// but it's often better to import it directly in test files.
// const app = require('../app'); // Your Express app
// global.request = supertest(app);
