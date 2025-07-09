module.exports = {
  env: {
    browser: false, // Assuming this is a Node.js backend, not browser environment
    commonjs: true,
    es2021: true,
    node: true,
    jest: true, // If you plan to add Jest for testing
  },
  extends: [
    'airbnb-base', // For a good set of base rules
    'plugin:prettier/recommended', // Integrates Prettier with ESLint
  ],
  parserOptions: {
    ecmaVersion: 'latest', // Use the latest ECMAScript features
  },
  plugins: [
    'prettier', // Runs Prettier as an ESLint rule
    // 'security' // Optional: For security-related linting rules, install eslint-plugin-security
  ],
  rules: {
    'prettier/prettier': ['error', {}, { usePrettierrc: true }], // Use .prettierrc options
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off', // Allow console in dev
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'consistent-return': 'off', // Allow functions to sometimes return a value and sometimes not
    'no-underscore-dangle': ['error', { 'allow': ['_id'] }], // Allow _id for MongoDB
    'class-methods-use-this': 'off', // Allow class methods that don't use 'this'
    'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_|req|res|next|err|error' }], // Warn on unused vars, ignore if starts with _ or common Express params
    'no-param-reassign': ['warn', { props: false }], // Allow reassignment of properties of parameters (e.g. req.user)
    'import/no-extraneous-dependencies': ['off'], // Can be too noisy with devDependencies

    // You can add more project-specific rules here
    // Example:
    // 'security/detect-object-injection': 'warn', // If eslint-plugin-security is installed

    // Override specific airbnb rules if needed
    // For example, if you prefer named exports:
    // 'import/prefer-default-export': 'off',
  },
  settings: {
    // 'import/resolver': { // If you have path aliases
    //   node: {
    //     paths: ['src'], // Example: if your source code is in 'src'
    //     extensions: ['.js', '.jsx', '.ts', '.tsx']
    //   }
    // }
  },
  ignorePatterns: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      'logs/',
      '.env',
      '*.log'
  ]
};
