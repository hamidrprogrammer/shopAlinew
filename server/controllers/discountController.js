const discountService = require('../services/discountService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// --- Admin Controllers ---

// @desc    Create a new discount code (Admin)
// @route   POST /api/v1/admin/discounts
// @access  Private/Admin
exports.createDiscount = catchAsync(async (req, res, next) => {
  const discountData = req.body;
  // Zod validation should handle detailed field checks in middleware
  const newDiscount = await discountService.createDiscount(discountData);

  logger.info(`Discount code "${newDiscount.code}" created by admin ${req.user.id}.`);
  res.status(201).json({
    status: 'success',
    message: 'Discount code created successfully.',
    data: {
      discount: newDiscount,
    },
  });
});

// @desc    Get all discount codes (Admin)
// @route   GET /api/v1/admin/discounts
// @access  Private/Admin
exports.getAllDiscounts = catchAsync(async (req, res, next) => {
  const discounts = await discountService.getAllDiscounts(req.query);
  res.status(200).json({
    status: 'success',
    results: discounts.length, // Current page length
    data: {
      discounts,
    },
  });
});

// @desc    Get a single discount code by ID or Code (Admin)
// @route   GET /api/v1/admin/discounts/:idOrCode
// @access  Private/Admin
exports.getDiscount = catchAsync(async (req, res, next) => {
  const { idOrCode } = req.params;
  const discount = await discountService.getDiscountByIdOrCode(idOrCode);
  res.status(200).json({
    status: 'success',
    data: {
      discount,
    },
  });
});

// @desc    Update a discount code (Admin)
// @route   PUT /api/v1/admin/discounts/:id
// @access  Private/Admin
exports.updateDiscount = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  if (Object.keys(updateData).length === 0) {
    return next(new AppError('No data provided for update.', 400));
  }

  const updatedDiscount = await discountService.updateDiscount(id, updateData);
  logger.info(`Discount code "${updatedDiscount.code}" (ID: ${id}) updated by admin ${req.user.id}.`);
  res.status(200).json({
    status: 'success',
    message: 'Discount code updated successfully.',
    data: {
      discount: updatedDiscount,
    },
  });
});

// @desc    Delete a discount code (Admin)
// @route   DELETE /api/v1/admin/discounts/:id
// @access  Private/Admin
exports.deleteDiscount = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await discountService.deleteDiscount(id);
  logger.info(`Discount code (ID: ${id}) deleted by admin ${req.user.id}.`);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});


// --- User-facing Controller ---

// @desc    Validate a discount code and get its value for the cart (User)
// @route   POST /api/v1/discounts/validate
// @access  Public/Private (User might need to be logged in depending on policy)
exports.validateDiscountForCart = catchAsync(async (req, res, next) => {
  const { code, cartSubtotal, cartItems } = req.body;
  // cartItems structure: [{ product: 'productId', quantity: 2, price: 100.00 }, ...]
  // Price here should be the unit price of the item in the cart.

  if (!code || typeof cartSubtotal !== 'number' || !Array.isArray(cartItems)) {
    return next(new AppError('Discount code, cart subtotal, and cart items are required.', 400));
  }
  if (cartItems.some(item => !item.product || typeof item.quantity !== 'number' || typeof item.price !== 'number')) {
      return next(new AppError('Each cart item must have product ID, quantity, and price.', 400));
  }


  const validationResult = await discountService.validateAndGetDiscountForCart(code, cartSubtotal, cartItems);

  res.status(200).json({
    status: 'success',
    message: validationResult.message,
    data: {
      code: validationResult.code,
      discountAmount: validationResult.discountAmount,
      discountId: validationResult.discountId, // Useful for applying to order
    },
  });
});
