const Order = require('../models/Order');
const Product = require('../models/Product');
const discountService = require('./discountService'); // Import discountService
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const logger = require('../utils/logger');
const mongoose = require('mongoose'); // For transaction management

// @desc    Create a new order
// @access  Private (User)
exports.createOrder = async (userId, orderData) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = orderData;

  if (!orderItems || orderItems.length === 0) {
    throw new AppError('No order items provided.', 400);
  }
  if (!shippingAddress) {
    throw new AppError('Shipping address is required.', 400);
  }
  if (!paymentMethod) {
    throw new AppError('Payment method is required.', 400);
  }

  // Denormalize product details into orderItems and validate product existence & stock
  const populatedOrderItems = [];
  let calculatedItemsPrice = 0;

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new AppError(`Product with ID ${item.product} not found.`, 404);
    }
    if (product.stockQuantity < item.quantity) {
      throw new AppError(`Not enough stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`, 400);
    }

    populatedOrderItems.push({
      product: product._id,
      name: product.name,
      sku: product.sku,
      quantity: item.quantity,
      price: product.salePrice || product.price, // Use sale price if available
      image: product.images && product.images.length > 0 ? (product.images.find(img => img.isPrimary) || product.images[0]).url : undefined,
    });
    calculatedItemsPrice += (product.salePrice || product.price) * item.quantity;
  }

  // Verify prices passed from client or recalculate them here for security/consistency
  // It's safer to recalculate totals on the backend.
  // The model's pre-save hook already does this, but we can double-check itemsPrice.
  if (itemsPrice !== undefined && Math.abs(calculatedItemsPrice - itemsPrice) > 0.01) { // Check with a small tolerance for floating point issues
      logger.warn(`Items price discrepancy. Client: ${itemsPrice}, Server Calculated: ${calculatedItemsPrice}. Using server calculated price.`);
  }

  // Tax and shipping prices would typically be calculated based on rules, location, etc.
  // For now, we trust the client or assume they are pre-calculated (e.g., during checkout steps)
  // The model's pre-save hook will calculate totalPrice based on these.

  const order = new Order({
    user: userId,
    orderItems: populatedOrderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice: calculatedItemsPrice, // Use server-calculated itemsPrice
    taxPrice: taxPrice || 0, // Default to 0 if not provided
    shippingPrice: shippingPrice || 0, // Default to 0 if not provided
    totalPrice: totalPrice, // Will be recalculated by pre-save hook based on the above
    // orderStatus will default to 'Pending'
  });

  // Use a session for transaction if updating product stock
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const newOrder = await order.save({ session });

    // Decrease stock quantity for each product in the order
    for (const item of newOrder.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: -item.quantity }
      }, { session });
    }

    // If a discount was applied, increment its usage count
    if (orderData.appliedDiscountId) {
        // We run this within the transaction session as well,
        // though incrementing usage might not strictly need to be transactional with order creation
        // depending on business rules (e.g., if usage count is approximate or eventual consistency is OK).
        // For strict consistency, include it.
        await discountService.incrementDiscountUsage(orderData.appliedDiscountId);
        // Note: incrementDiscountUsage itself should be robust and not fail the transaction
        // if the discount is suddenly deleted or limit reached due to a race condition,
        // or it should be designed to be idempotent or safe to retry.
        // The current implementation of incrementDiscountUsage logs errors but doesn't throw,
        // which is suitable here to not roll back the order for a non-critical counter update.
        // If it *must* succeed or roll back, incrementDiscountUsage should throw an error on failure.
        logger.info(`Usage count for discount ID ${orderData.appliedDiscountId} processed for order ${newOrder._id}.`);
    }


    await session.commitTransaction();
    logger.info(`Order ${newOrder._id} created successfully by user ${userId}. Stock updated.`);

    // Populate user and product details for the response
    // await newOrder.populate('user', 'name email'); -> User is already userId, can populate in controller if needed
    // await newOrder.populate('orderItems.product', 'name slug'); -> Product ID is already there, name is denormalized.

    return newOrder;

  } catch (error) {
    await session.abortTransaction();
    logger.error(`Error creating order or updating stock: ${error.message}`, error);
    // Specific error handling for stock issues during transaction can be added
    throw new AppError('Failed to create order. Please try again.', 500);
  } finally {
    session.endSession();
  }
};

// @desc    Get order by ID
// @access  Private (User who owns order, or Admin)
exports.getOrderById = async (orderId, userId, userRole) => {
  const order = await Order.findById(orderId)
    .populate('user', 'name email') // Populate user details
    .populate('orderItems.product', 'slug'); // Populate some product details (like slug) for links

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  // Check if the user is authorized to view this order
  if (order.user._id.toString() !== userId.toString() && userRole !== 'admin') {
    throw new AppError('Not authorized to view this order.', 403);
  }

  return order;
};

// @desc    Get all orders for a user (or all orders for admin)
// @access  Private (User for their own, Admin for all)
exports.getAllOrders = async (userId, userRole, queryParams) => {
  let query;
  const filter = {};

  if (userRole === 'admin') {
    // Admin can see all orders, potentially filter by user ID if provided in queryParams
    if (queryParams.userId) {
        filter.user = queryParams.userId;
    }
  } else {
    // Regular user can only see their own orders
    filter.user = userId;
  }

  query = Order.find(filter).populate('user', 'name email');

  const features = new APIFeatures(query, queryParams)
    .filter() // Allows admin to filter by other fields e.g. ?orderStatus=Pending
    .sort()   // Default sort can be -createdAt
    .limitFields()
    .paginate();

  const orders = await features.query;
  return orders;
};

// @desc    Update order status (e.g., to Shipped, Delivered)
// @access  Private/Admin
exports.updateOrderStatus = async (orderId, newStatus, trackingDetails = {}) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  // Validate newStatus against allowed enum values in Order model (handled by Mongoose)
  order.orderStatus = newStatus;

  if (newStatus === 'Shipped') {
    // order.shippedAt = Date.now(); // If you have a shippedAt field
    if (trackingDetails.trackingNumber) order.trackingNumber = trackingDetails.trackingNumber;
    if (trackingDetails.shippingCarrier) order.shippingCarrier = trackingDetails.shippingCarrier;
  } else if (newStatus === 'Delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  } else if (newStatus === 'Cancelled') {
    // If order is cancelled, consider reverting stock quantities
    // This needs careful handling to avoid race conditions or multiple reversions
    // For simplicity, stock reversion is not implemented here, but is an important consideration.
    // One approach: check if stock was already reverted.
    logger.warn(`Order ${orderId} cancelled. Stock quantity not automatically reverted in this step.`);
  }
  // Add more logic for other statuses as needed

  const updatedOrder = await order.save();
  logger.info(`Order ${orderId} status updated to ${newStatus}.`);
  return updatedOrder;
};

// @desc    Update order to paid (typically after payment gateway confirmation)
// @access  Private/Admin (or system process via webhook)
exports.updateOrderToPaid = async (orderId, paymentResult) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  if (order.isPaid) {
    logger.warn(`Order ${orderId} is already marked as paid.`);
    // return order; // Or throw error if trying to repay
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = paymentResult; // Store transaction details from payment gateway

  // Update order status based on payment.
  // If it was 'Pending', move to 'Processing'. If 'Payment Failed', also move to 'Processing'.
  if (order.orderStatus === 'Pending' || order.orderStatus === 'Payment Failed') {
      order.orderStatus = 'Processing';
  }

  const updatedOrder = await order.save();
  logger.info(`Order ${orderId} marked as paid. Payment ID: ${paymentResult.id}`);

  // TODO: Send order confirmation email to user
  // emailService.sendOrderConfirmation(order.user.email, order);

  return updatedOrder;
};

// @desc    Delete an order (use with caution, usually orders are not hard-deleted)
// @access  Private/Admin
exports.deleteOrder = async (orderId) => {
    // Orders usually aren't deleted due to financial records.
    // Consider an 'archive' or 'cancel' status instead.
    // If hard delete is required:
    const order = await Order.findById(orderId);
    if (!order) {
        throw new AppError('Order not found', 404);
    }
    // Add checks: e.g., cannot delete processed/shipped orders unless specific conditions met.
    // Consider implications on stock (reverting stock if order items were deducted).
    // This is a destructive operation.

    // Example: Revert stock (simplified, ensure idempotency or flags to prevent multiple reversions)
    // const session = await mongoose.startSession();
    // session.startTransaction();
    // try {
    //     for (const item of order.orderItems) {
    //         await Product.findByIdAndUpdate(item.product, {
    //             $inc: { stockQuantity: item.quantity }
    //         }, { session });
    //     }
    //     await order.deleteOne({ session });
    //     await session.commitTransaction();
    //     logger.info(`Order ${orderId} deleted and stock reverted.`);
    //     return { message: 'Order deleted successfully and stock reverted.' };
    // } catch (error) {
    //     await session.abortTransaction();
    //     logger.error(`Error deleting order ${orderId} or reverting stock: ${error.message}`, error);
    //     throw new AppError('Failed to delete order.', 500);
    // } finally {
    //     session.endSession();
    // }

    // For now, simple delete without stock reversion logic here (as it's complex)
    await order.deleteOne();
    logger.warn(`Order ${orderId} hard deleted. Ensure stock and financial implications are handled.`);
    return { message: 'Order deleted successfully.' };
};
