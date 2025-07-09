module.exports = {
  testEnvironment: 'node', // Use Node.js environment for testing backend code
  // preset: '@shelf/jest-mongodb', // This preset handles MongoDB setup and teardown automatically
                                // It will look for jest-mongodb-config.js or use defaults.

  // Or, if you prefer more control or have issues with the preset,
  // you can set up MongoDB manually in a global setup file.
  // For now, let's try with the preset first.

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    '**/*.js', // Collect from all JS files
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!server.js', // Usually, the main server startup script is not directly tested this way
    '!**/config/**', // Config files might not need coverage
    '!**/utils/logger.js', // Logger might be hard to test for coverage directly
    // Add other files/folders to ignore for coverage
  ],

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],

  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // The maximum amount of time this test suite can run for before timing out
  testTimeout: 30000, // Optional: increase if tests are long (e.g., DB operations)

  // A path to a module which exports an async function that is triggered once before all test suites
  globalSetup: './tests/globalSetup.js', // If using manual DB setup

  // A path to a module which exports an async function that is triggered once after all test suites
  globalTeardown: './tests/globalTeardown.js', // If using manual DB setup

  // A list of paths to modules that run some code to configure or set up the testing framework before each test file in the suite is executed
  setupFilesAfterEnv: ['./tests/setupFile.js'], // For things like extending expect, or per-file setup

  // Test file name pattern
  testMatch: [
    '**/tests/**/*.test.js', // Standard pattern: any .test.js file under a tests folder
    '**/?(*.)+(spec|test).js', // Or .spec.js / .test.js anywhere
  ],

  // Module file extensions for Jest to look for
  moduleFileExtensions: ['js', 'json', 'node'],

  // Directories where Jest should search for modules.
  // '<rootDir>' is the `rootDir` specified in the command or this config.
  // Adding 'node_modules' explicitly can sometimes help.
  moduleDirectories: ['node_modules', '<rootDir>/node_modules'],

  // Transform files before running tests (e.g., for Babel if using ES6+ features not supported by current Node)
  // transform: {}, // Not needed if your Node version supports all your JS syntax

  // Indicates whether each individual test should be reported during the run
  verbose: true, // Show individual test results

  // Watch plugins
  // watchPlugins: [ // Optional: if using watch mode extensively
  //   'jest-watch-typeahead/filename',
  //   'jest-watch-typeahead/testname',
  // ],
};
