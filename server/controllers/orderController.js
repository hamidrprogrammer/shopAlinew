const orderService = require('../services/orderService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// @desc    Create a new order
// @route   POST /api/v1/orders
// @access  Private (User)
exports.createOrder = catchAsync(async (req, res, next) => {
  // req.user.id will be available from 'protect' middleware
  const userId = req.user.id;
  const orderData = req.body; // { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice }

  // Basic validation, more robust validation with Zod in middleware
  if (!orderData.orderItems || orderData.orderItems.length === 0) {
    return next(new AppError('Order items are required.', 400));
  }
  if (!orderData.shippingAddress) {
    return next(new AppError('Shipping address is required.', 400));
  }
  if (!orderData.paymentMethod) {
    return next(new AppError('Payment method is required.', 400));
  }

  const newOrder = await orderService.createOrder(userId, orderData);

  logger.info(`Order created: ${newOrder._id} by user ${userId}`);
  res.status(201).json({
    status: 'success',
    message: 'Order created successfully',
    data: {
      order: newOrder,
    },
  });
});

// @desc    Get logged in user's orders
// @route   GET /api/v1/orders/myorders
// @access  Private (User)
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  // req.query will be used for pagination, sorting by APIFeatures in service
  const orders = await orderService.getAllOrders(userId, req.user.role, req.query);

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders,
    },
  });
});

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Private (User who owns order, or Admin)
exports.getOrderById = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  const order = await orderService.getOrderById(orderId, userId, userRole);

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});


// --- Admin Only Routes ---

// @desc    Get all orders (Admin)
// @route   GET /api/v1/orders
// @access  Private/Admin
exports.getAllOrdersAdmin = catchAsync(async (req, res, next) => {
  // Admin role is already verified by middleware
  // req.query can contain filters like userId, status, etc.
  const orders = await orderService.getAllOrders(req.user.id, 'admin', req.query);

  res.status(200).json({
    status: 'success',
    results: orders.length, // This is current page length. Total count might be needed.
    data: {
      orders,
    },
  });
});

// @desc    Update order status (e.g., to Shipped, Delivered) by Admin
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatusAdmin = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;
  const { status, trackingNumber, shippingCarrier } = req.body; // new status from request body

  if (!status) {
    return next(new AppError('New order status is required.', 400));
  }

  const trackingDetails = { trackingNumber, shippingCarrier };
  const updatedOrder = await orderService.updateOrderStatus(orderId, status, trackingDetails);

  logger.info(`Order ${orderId} status updated to ${status} by admin ${req.user.id}`);
  res.status(200).json({
    status: 'success',
    message: `Order status updated to ${status}`,
    data: {
      order: updatedOrder,
    },
  });
});

// @desc    Update order to paid (e.g., manual confirmation or after webhook) by Admin
// @route   PUT /api/v1/orders/:id/pay
// @access  Private/Admin
exports.updateOrderToPaidAdmin = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;
  // paymentResult might come from req.body if it's a manual update by admin
  // For a webhook, this controller might not be hit directly, or webhook handler calls the service.
  const paymentResult = req.body.paymentResult || { id: `MANUAL_${Date.now()}`, status: 'succeeded', update_time: new Date().toISOString(), email_address: 'admin@example.com' };

  const updatedOrder = await orderService.updateOrderToPaid(orderId, paymentResult);

  logger.info(`Order ${orderId} marked as paid by admin ${req.user.id}`);
  res.status(200).json({
    status: 'success',
    message: 'Order marked as paid',
    data: {
      order: updatedOrder,
    },
  });
});

// @desc    Delete an order (Admin)
// @route   DELETE /api/v1/orders/:id
// @access  Private/Admin
exports.deleteOrderAdmin = catchAsync(async (req, res, next) => {
    const orderId = req.params.id;
    await orderService.deleteOrder(orderId);

    logger.info(`Order ${orderId} deleted by admin ${req.user.id}`);
    res.status(204).json({
        status: 'success',
        data: null,
    });
});
