const express = require('express');
const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const userAdminRoutes = require('./userAdminRoutes');
const reviewRoutes = require('./reviewRoutes');
const discountRoutes = require('./discountRoutes');
const settingRoutes = require('./settingRoutes'); // Import setting routes
// const userRoutes = require('./userRoutes'); // This would be for user's own actions if needed
// const uploadRoutes = require('./uploadRoutes');
// const webhookRoutes = require('./webhookRoutes');
// const adminRoutes = require('./adminRoutes'); // For admin-specific aggregated routes

const router = express.Router();

const defaultRoutes = [
  { path: '/auth', route: authRoutes },
  { path: '/categories', route: categoryRoutes },
  { path: '/products', route: productRoutes },
  { path: '/orders', route: orderRoutes },
  { path: '/admin/users', route: userAdminRoutes }, // Admin routes for user management
  { path: '/reviews', route: reviewRoutes },       // Standalone review routes
  { path: '/discounts', route: discountRoutes },   // Discount routes (includes admin and user-facing validation)
  { path: '/settings', route: settingRoutes },     // Store settings routes
  // { path: '/users', route: userRoutes }, // For user's own profile, etc.
  // { path: '/uploads', route: uploadRoutes },
  // { path: '/webhooks', route: webhookRoutes },
  // { path: '/admin', route: adminRoutes }, // Example: /api/v1/admin/users, /api/v1/admin/orders
];

// You can also define more specific routes if needed, for example, admin routes
// const adminOnlyRoutes = [
//   { path: '/admin/dashboard', route: adminDashboardRoutes },
// ];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

// Health check route for the API
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is healthy and running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime() // Uptime in seconds
  });
});

module.exports = router;
