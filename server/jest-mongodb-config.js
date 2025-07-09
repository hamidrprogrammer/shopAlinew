// This file is used by @shelf/jest-mongodb preset
module.exports = {
  mongodbMemoryServerOptions: {
    binary: {
      version: '6.0.12', // Specify your desired MongoDB version (or 'latest', or remove to use default)
      skipMD5: true,
    },
    autoStart: false, // We will start/stop it manually or let the preset handle it.
                     // If true, it starts with Jest. If false, preset might still start it.
                     // For preset, it's usually better to let it manage start/stop.
    instance: {
      // dbName: 'jest', // Default is 'jest'
      // port: 27017, // Default is a random available port
    },
  },
  // mongoURLEnvName: 'MONGO_URI_TEST_JEST' // Optional: if you want to set a specific env var name for the mongo URI
                                       // Default is MONGO_URL
};
