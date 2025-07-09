const Discount = require('../models/Discount');
const Product = require('../models/Product'); // For validating product/category applicability
const Category = require('../models/Category');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const logger = require('../utils/logger');

// @desc    Create a new discount code (Admin)
// @access  Admin
exports.createDiscount = async (discountData) => {
  const { code, discountType, discountValue, applicableTo, applicableProductIds, applicableCategoryIds, startDate, endDate } = discountData;

  // Basic validation (more can be added with Zod in middleware)
  if (!code || !discountType || !discountValue) {
    throw new AppError('Code, discount type, and discount value are required.', 400);
  }

  // Ensure applicable IDs are valid if provided
  if (applicableTo === 'specific_products' && applicableProductIds && applicableProductIds.length > 0) {
    const products = await Product.find({ _id: { $in: applicableProductIds } });
    if (products.length !== applicableProductIds.length) {
      throw new AppError('One or more applicable product IDs are invalid.', 400);
    }
  } else if (applicableTo === 'specific_categories' && applicableCategoryIds && applicableCategoryIds.length > 0) {
    const categories = await Category.find({ _id: { $in: applicableCategoryIds } });
    if (categories.length !== applicableCategoryIds.length) {
      throw new AppError('One or more applicable category IDs are invalid.', 400);
    }
  }

  // Date validation (model also validates endDate > startDate)
  if (endDate && startDate && new Date(endDate) <= new Date(startDate)) {
      throw new AppError('End date must be after the start date.', 400);
  }

  const newDiscount = await Discount.create(discountData);
  logger.info(`Discount code "${newDiscount.code}" created. ID: ${newDiscount._id}`);
  return newDiscount;
};

// @desc    Get all discount codes (Admin)
// @access  Admin
exports.getAllDiscounts = async (queryParams) => {
  const features = new APIFeatures(Discount.find(), queryParams)
    .filter() // Filter by code, isActive, discountType, etc.
    .sort()   // Sort by createdAt, code, endDate, etc.
    .limitFields()
    .paginate();

  const discounts = await features.query;
  // const totalDiscounts = await Discount.countDocuments(features.mongooseQuery.getFilter());
  return discounts; // { discounts, totalDiscounts (optional) }
};

// @desc    Get a single discount code by ID or Code (Admin)
// @access  Admin
exports.getDiscountByIdOrCode = async (identifier) => {
  let discount;
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) { // Check if it's an ObjectId
    discount = await Discount.findById(identifier);
  } else {
    // Assume it's a discount code (case-insensitive search recommended for codes)
    discount = await Discount.findOne({ code: identifier.toUpperCase() });
  }

  if (!discount) {
    throw new AppError(`Discount not found with identifier: ${identifier}`, 404);
  }
  return discount;
};

// @desc    Update a discount code (Admin)
// @access  Admin
exports.updateDiscount = async (discountId, updateData) => {
  const discount = await Discount.findById(discountId);
  if (!discount) {
    throw new AppError(`Discount not found with ID: ${discountId}`, 404);
  }

  // Prevent changing code directly or handle carefully if allowed
  if (updateData.code && updateData.code.toUpperCase() !== discount.code) {
     const existingCode = await Discount.findOne({ code: updateData.code.toUpperCase() });
     if (existingCode && existingCode._id.toString() !== discountId) {
         throw new AppError(`Discount code "${updateData.code}" already exists.`, 409);
     }
  }

  // Date validation
  const newStartDate = updateData.startDate ? new Date(updateData.startDate) : discount.startDate;
  const newEndDate = updateData.endDate ? new Date(updateData.endDate) : discount.endDate;
  if (newEndDate && newStartDate && newEndDate <= newStartDate) {
      throw new AppError('End date must be after the start date.', 400);
  }

  // Validate applicable IDs if changed
  if (updateData.applicableTo === 'specific_products' && updateData.applicableProductIds) {
    const products = await Product.find({ _id: { $in: updateData.applicableProductIds } });
    if (products.length !== updateData.applicableProductIds.length) {
      throw new AppError('One or more new applicable product IDs are invalid.', 400);
    }
  } else if (updateData.applicableTo === 'specific_categories' && updateData.applicableCategoryIds) {
    const categories = await Category.find({ _id: { $in: updateData.applicableCategoryIds } });
    if (categories.length !== updateData.applicableCategoryIds.length) {
      throw new AppError('One or more new applicable category IDs are invalid.', 400);
    }
  }

  // Update fields
  Object.keys(updateData).forEach(key => {
    discount[key] = updateData[key];
  });

  const updatedDiscount = await discount.save(); // Triggers Mongoose validations
  logger.info(`Discount code "${updatedDiscount.code}" (ID: ${discountId}) updated.`);
  return updatedDiscount;
};

// @desc    Delete a discount code (Admin)
// @access  Admin
exports.deleteDiscount = async (discountId) => {
  const discount = await Discount.findById(discountId);
  if (!discount) {
    throw new AppError(`Discount not found with ID: ${discountId}`, 404);
  }
  // Consider implications: if discount was used in orders, it should remain for historical data.
  // Soft delete (setting isActive = false) is often better.
  // If hard delete is required:
  await discount.deleteOne();
  logger.info(`Discount code "${discount.code}" (ID: ${discountId}) deleted.`);
  return { message: 'Discount code deleted successfully.' };
};


// @desc    Validate and get a discount code for application (User/Cart)
// @access  Public/User
exports.validateAndGetDiscountForCart = async (code, cartSubtotal, cartItems) => {
  if (!code) {
    throw new AppError('Discount code is required.', 400);
  }
  const discount = await Discount.findOne({ code: code.toUpperCase() });

  if (!discount || !discount.isValid) { // isValid is a virtual property
    throw new AppError('Invalid or expired discount code.', 400);
  }

  if (cartSubtotal < discount.minimumPurchaseAmount) {
    throw new AppError(`Minimum purchase of ${discount.minimumPurchaseAmount} is required for this discount.`, 400);
  }

  // Check applicability to items in cart
  let applicableItemsValue = 0;
  if (discount.applicableTo === 'all_products') {
      applicableItemsValue = cartSubtotal;
  } else if (discount.applicableTo === 'specific_products') {
      cartItems.forEach(item => {
          if (discount.applicableProductIds.map(id => id.toString()).includes(item.product.toString())) {
              applicableItemsValue += item.price * item.quantity;
          }
      });
      if (applicableItemsValue === 0) {
          throw new AppError('This discount code is not applicable to any items in your cart.', 400);
      }
  } else if (discount.applicableTo === 'specific_categories') {
      // This requires knowing the categories of products in the cart.
      // For simplicity, assume cartItems have populated category info or we fetch it.
      // This part can be complex and may need optimization.
      const productIdsInCart = cartItems.map(item => item.product);
      const productsInCart = await Product.find({ _id: { $in: productIdsInCart } }).select('categories');

      productsInCart.forEach(product => {
          const itemInCart = cartItems.find(ci => ci.product.toString() === product._id.toString());
          if (product.categories.some(catId => discount.applicableCategoryIds.map(id => id.toString()).includes(catId.toString()))) {
              applicableItemsValue += itemInCart.price * itemInCart.quantity;
          }
      });
       if (applicableItemsValue === 0) {
          throw new AppError('This discount code is not applicable to any items in your cart based on category.', 400);
      }
  }

  // Calculate discount amount
  let discountAmount = 0;
  if (discount.discountType === 'percentage') {
    // Apply percentage discount only on the value of applicable items
    discountAmount = (applicableItemsValue * discount.discountValue) / 100;
  } else if (discount.discountType === 'fixed_amount') {
    // Fixed amount can't exceed the value of applicable items (or cartSubtotal if simpler)
    discountAmount = Math.min(discount.discountValue, applicableItemsValue);
  }

  // Ensure discount doesn't make total negative, though usually applied before shipping/tax.
  discountAmount = Math.round(discountAmount * 100) / 100; // Round to 2 decimal places

  return {
    discountId: discount._id,
    code: discount.code,
    discountAmount,
    message: 'Discount applied successfully.'
  };
};

// @desc    Increment usage count for a discount (after successful order)
// @access  System (called internally by OrderService)
exports.incrementDiscountUsage = async (discountId) => {
    if (!discountId) return;
    try {
        const discount = await Discount.findById(discountId);
        if (discount && (discount.usageLimit === null || discount.timesUsed < discount.usageLimit)) {
            discount.timesUsed += 1;
            await discount.save({ validateBeforeSave: false }); // Avoid running all validators
            logger.info(`Usage count for discount ${discount.code} (ID: ${discountId}) incremented to ${discount.timesUsed}.`);
        } else if (discount) {
            logger.warn(`Attempted to increment usage for discount ${discount.code} beyond limit or discount not found.`);
        }
    } catch (error) {
        logger.error(`Error incrementing usage for discount ID ${discountId}: ${error.message}`);
    }
};
