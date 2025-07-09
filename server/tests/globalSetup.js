const { MongoMemoryServer } = require('./node_modules/mongodb-memory-server'); // Assuming __dirname is rootDir
const path = require('path');
const fs = require('fs');

const globalConfigPath = path.join(__dirname, 'globalConfig.json');

module.exports = async () => {
  // console.log('\nStarting MongoDB Memory Server for tests...');
  const mongod = await MongoMemoryServer.create({
    instance: {
      // dbName: 'jest_db', // Optional: specify a DB name
      // port: Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000, // Random port
    },
    binary: {
      version: '6.0.12', // Match version in jest-mongodb-config.js or your prod version
      // skipMD5: true, // Can speed up download if binary is already cached
    }
  });

  const mongoUri = mongod.getUri();

  // Store mongod instance and URI in global so it can be accessed in globalTeardown and setupFile
  global.__MONGOD__ = mongod;
  process.env.MONGO_URI_TEST = mongoUri; // Used by setupFile.js and db.js config

  // console.log(`MongoDB Memory Server started at: ${mongoUri}`);

  // Optional: Write URI to a temp file if needed by other processes or for debugging
  // This is generally not needed if using process.env
  // const MONGODB_URI_FILE = path.join(path.dirname(globalConfigPath), '.mongodb_uri');
  // fs.writeFileSync(MONGODB_URI_FILE, mongoUri);

  // Store the URI in a way that can be read by the main Jest process if needed,
  // though process.env is usually sufficient.
  // For @shelf/jest-mongodb, it writes to globalConfigPath. We can mimic this if necessary.
  // fs.writeFileSync(globalConfigPath, JSON.stringify({ mongoUri }));
};
