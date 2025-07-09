const express = require('express');
const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const userAdminRoutes = require('./userAdminRoutes');
const reviewRoutes = require('./reviewRoutes');
const discountRoutes = require('./discountRoutes');
const settingRoutes = require('./settingRoutes');
const adminLogRoutes = require('./adminLogRoutes'); // Added
const uploadRoutes = require('./uploadRoutes');   // Added
const webhookRoutes = require('./webhookRoutes'); // Added

const router = express.Router();

const defaultRoutes = [
  { path: '/auth', route: authRoutes },
  { path: '/categories', route: categoryRoutes },
  { path: '/products', route: productRoutes },
  { path: '/orders', route: orderRoutes },
  { path: '/admin/users', route: userAdminRoutes },
  { path: '/admin/logs', route: adminLogRoutes }, // Added
  { path: '/reviews', route: reviewRoutes },
  { path: '/discounts', route: discountRoutes },
  { path: '/settings', route: settingRoutes },
  { path: '/uploads', route: uploadRoutes },     // Added
  { path: '/webhooks', route: webhookRoutes },   // Added
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

// Health check route for the API
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is healthy and running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
