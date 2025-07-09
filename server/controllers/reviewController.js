const reviewService = require('../services/reviewService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// @desc    Create a new review for a product
// @route   POST /api/v1/products/:productId/reviews  (if nested)
// @route   POST /api/v1/reviews (if standalone, productId in body)
// @access  Private (User)
exports.createReview = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  // If routes are nested like /products/:productId/reviews, productId comes from req.params
  // If standalone /reviews, productId comes from req.body
  const productId = req.params.productId || req.body.productId;
  const reviewData = req.body; // { review, rating, title }

  if (!productId) {
    return next(new AppError('Product ID is required to create a review.', 400));
  }
  if (!reviewData.review || !reviewData.rating) {
    return next(new AppError('Review text and rating are required.', 400));
  }

  const newReview = await reviewService.createReview(userId, productId, reviewData);

  logger.info(`Review created for product ${productId} by user ${userId}. Review ID: ${newReview._id}`);
  res.status(201).json({
    status: 'success',
    message: 'Review submitted successfully.',
    data: {
      review: newReview,
    },
  });
});

// @desc    Get all reviews (optionally filtered by product or user)
// @route   GET /api/v1/reviews
// @route   GET /api/v1/products/:productId/reviews (if nested)
// @access  Public (for product reviews), Private/Admin (for specific filtering)
exports.getAllReviews = catchAsync(async (req, res, next) => {
  const queryParams = { ...req.query };
  // If nested route, add productId to filter
  if (req.params.productId) {
    queryParams.product = req.params.productId;
  }

  const reviews = await reviewService.getAllReviews(queryParams);

  res.status(200).json({
    status: 'success',
    results: reviews.length, // This is current page length.
    data: {
      reviews,
    },
  });
});

// @desc    Get a single review by ID
// @route   GET /api/v1/reviews/:id
// @access  Public (or Private depending on policy)
exports.getReviewById = catchAsync(async (req, res, next) => {
  const reviewId = req.params.id;
  const review = await reviewService.getReviewById(reviewId);

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

// @desc    Update a review
// @route   PUT /api/v1/reviews/:id
// @access  Private (Owner or Admin)
exports.updateReview = catchAsync(async (req, res, next) => {
  const reviewId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;
  const updateData = req.body; // { review, rating, title }

  if (Object.keys(updateData).length === 0) {
    return next(new AppError('No data provided for update.', 400));
  }
  // Ensure only allowed fields are passed or handle in service
  const allowedUpdates = ['review', 'rating', 'title'];
  for (const key in updateData) {
    if (!allowedUpdates.includes(key)) {
      // Could also delete updateData[key]
      return next(new AppError(`Field '${key}' cannot be updated or is not recognized.`, 400));
    }
  }


  const updatedReview = await reviewService.updateReview(reviewId, userId, userRole, updateData);

  logger.info(`Review ${reviewId} updated by user ${userId}.`);
  res.status(200).json({
    status: 'success',
    message: 'Review updated successfully.',
    data: {
      review: updatedReview,
    },
  });
});

// @desc    Delete a review
// @route   DELETE /api/v1/reviews/:id
// @access  Private (Owner or Admin)
exports.deleteReview = catchAsync(async (req, res, next) => {
  const reviewId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  await reviewService.deleteReview(reviewId, userId, userRole);

  logger.info(`Review ${reviewId} deleted by user ${userId}.`);
  res.status(204).json({ // 204 No Content for successful deletion
    status: 'success',
    data: null,
  });
});
