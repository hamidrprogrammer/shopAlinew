// const path = require('path');
// const fs = require('fs');

// const globalConfigPath = path.join(__dirname, 'globalConfig.json');

module.exports = async () => {
  if (global.__MONGOD__) {
    // console.log('\nStopping MongoDB Memory Server...');
    await global.__MONGOD__.stop();
    // console.log('MongoDB Memory Server stopped.');
  }

  // Optional: Clean up temp URI file if created
  // const MONGODB_URI_FILE = path.join(path.dirname(globalConfigPath), '.mongodb_uri');
  // if (fs.existsSync(MONGODB_URI_FILE)) {
  //   fs.unlinkSync(MONGODB_URI_FILE);
  // }

  // Optional: Clean up global config file if we wrote to it
  // if (fs.existsSync(globalConfigPath)) {
  //   fs.unlinkSync(globalConfigPath);
  // }
};
