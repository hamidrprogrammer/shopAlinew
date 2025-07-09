module.exports = {
  apps: [
    {
      name: 'furniture-store-api', // Your application name
      script: 'server.js', // The script PM2 will run
      // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/

      // instances: 'max', // Or a specific number of instances for clustering
      // exec_mode: 'cluster', // Enable clustering mode (requires app to be designed for it)
      // Note: Clustering with Mongoose needs careful handling of connections if not stateless.
      // For simplicity, we'll start with a single instance (fork mode, default).

      autorestart: true, // Restart an app if it crashes
      watch: false, // Watch for file changes and restart (disable in production, use deployment process for updates)
                    // Can be true or an array of paths in development.
      max_memory_restart: '1G', // Restart app if it exceeds 1GB memory (adjust as needed)

      // Environment variables specific to this app
      env: {
        NODE_ENV: 'development',
        // Other common dev variables can be set here too
      },
      env_production: { // Environment variables for production mode
        NODE_ENV: 'production',
        PORT: 5000, // Or your production port
        // MONGO_URI: 'your_production_mongo_uri', // Should be set in deployment environment
        // JWT_SECRET: 'your_production_jwt_secret', // Should be set in deployment environment
        // CLIENT_URL: 'your_production_client_url',
        // Add other production-specific environment variables here
        // These can also be managed by your deployment platform's environment variable settings
      },

      // Log file configuration
      // output: './logs/pm2-out.log', // Path to a file to save stdout
      // error: './logs/pm2-error.log', // Path to a file to save stderr
      // log_date_format: 'YYYY-MM-DD HH:mm Z', // Date format for logs
      // merge_logs: true, // Merge logs from all instances if using cluster mode

      // Advanced options:
      // wait_ready: true, // Wait for 'ready' signal from app before considering it started
      // listen_timeout: 3000, // Timeout for 'ready' signal
      // kill_timeout: 1600, // Timeout for graceful shutdown
    },
  ],

  // Optional: Deployment configuration (if using PM2 for deployment)
  // deploy: {
  //   production: {
  //     user: 'node_user', // User on the server
  //     host: 'your_server_ip',
  //     ref: 'origin/main', // Git branch
  //     repo: 'git@github.com:your_repo.git',
  //     path: '/var/www/production',
  //     'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
  //   },
  // },
};
