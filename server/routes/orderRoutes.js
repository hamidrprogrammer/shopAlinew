const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, createOrderSchema, updateOrderStatusSchema, updateOrderToPaidSchema } = require('../middleware/validationMiddleware');

const router = express.Router();

// All routes below are protected (user must be logged in)
router.use(protect);

// --- User specific routes ---
// Create a new order
router.post('/', validate(createOrderSchema), orderController.createOrder);

// Get logged in user's orders
router.get('/myorders', orderController.getMyOrders);

// Get a specific order by ID (user must own this order or be admin)
router.get('/:id', orderController.getOrderById);


// --- Admin specific routes ---
// All routes below this point require admin privileges.
router.use(authorize('admin'));

// Get all orders (Admin view)
router.get('/', orderController.getAllOrdersAdmin); // Note: This overrides GET /:id for admin if not placed carefully.
                                                 // However, Express matches specific strings like '/myorders' before parameterized routes like '/:id'.
                                                 // And GET / for admin is distinct from GET /:id for user.
                                                 // So, GET / (admin) and GET /myorders (user) and GET /:id (user/admin) should work.

// Update order status to Shipped, Delivered, etc. (Admin)
router.put('/:id/status', validate(updateOrderStatusSchema), orderController.updateOrderStatusAdmin);

// Mark order as paid (Admin - e.g. for manual bank transfer confirmation)
router.put('/:id/pay', validate(updateOrderToPaidSchema), orderController.updateOrderToPaidAdmin);

// Delete an order (Admin - use with caution)
router.delete('/:id', orderController.deleteOrderAdmin);


module.exports = router;
