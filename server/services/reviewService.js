const Review = require('../models/Review');
const Product = require('../models/Product'); // To check if product exists before adding review
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const logger = require('../utils/logger');

// @desc    Create a new review for a product
// @access  Private (User)
exports.createReview = async (userId, productId, reviewData) => {
  const { review, rating, title } = reviewData;

  // Check if the product exists
  const productExists = await Product.findById(productId);
  if (!productExists) {
    throw new AppError(`Product not found with ID: ${productId}. Cannot add review.`, 404);
  }

  // Check if the user has already reviewed this product
  // The unique compound index on (product, user) in Review model handles this at DB level.
  // We can also check here to provide a cleaner error message.
  const existingReview = await Review.findOne({ product: productId, user: userId });
  if (existingReview) {
    throw new AppError('You have already submitted a review for this product.', 409); // Conflict
  }

  // Check if user has purchased the product (optional, but common for verified reviews)
  // This would require looking into Order history.
  // For now, assume any logged-in user can review.
  // const canReview = await checkIfUserPurchasedProduct(userId, productId);
  // if (!canReview) {
  //   throw new AppError('You can only review products you have purchased.', 403);
  // }


  const newReview = await Review.create({
    review,
    rating,
    title, // Optional
    product: productId,
    user: userId,
  });

  // The post-save hook on Review model will automatically update product ratings.
  logger.info(`Review created for product ${productId} by user ${userId}. Review ID: ${newReview._id}`);
  return newReview;
};

// @desc    Get all reviews (can be filtered by product or user)
// @access  Public (for product reviews), Private/Admin (for user reviews or all reviews)
exports.getAllReviews = async (queryParams) => {
  // APIFeatures will handle filtering, e.g., ?product=<productId> or ?user=<userId>
  // It will also handle sorting (e.g., by createdAt, rating) and pagination.
  const features = new APIFeatures(Review.find(), queryParams)
    .filter()
    .sort() // Default sort can be -createdAt
    .limitFields() // Default select behavior in Review model populates user.
    .paginate();

  const reviews = await features.query;
  // const totalReviews = await Review.countDocuments(features.mongooseQuery.getFilter());

  return reviews; // { reviews, totalReviews (optional) }
};

// @desc    Get a single review by ID
// @access  Private (Owner or Admin) - or Public if reviews are generally accessible by ID
exports.getReviewById = async (reviewId) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError(`Review not found with ID: ${reviewId}`, 404);
  }
  return review;
};

// @desc    Update a review (by owner or Admin)
// @access  Private (Owner or Admin)
exports.updateReview = async (reviewId, userId, userRole, updateData) => {
  const reviewDoc = await Review.findById(reviewId);
  if (!reviewDoc) {
    throw new AppError(`Review not found with ID: ${reviewId}`, 404);
  }

  // Check authorization: User can only update their own review, Admin can update any.
  if (reviewDoc.user._id.toString() !== userId.toString() && userRole !== 'admin') {
    throw new AppError('You are not authorized to update this review.', 403);
  }

  // Fields that can be updated (e.g., review text, rating, title)
  if (updateData.review) reviewDoc.review = updateData.review;
  if (updateData.rating) reviewDoc.rating = updateData.rating;
  if (updateData.title) reviewDoc.title = updateData.title;
  // Admin might be able to change 'isApproved' status if implemented.
  // if (userRole === 'admin' && typeof updateData.isApproved === 'boolean') {
  //   reviewDoc.isApproved = updateData.isApproved;
  // }

  // The pre/post findOneAndUpdate hooks on Review model will trigger rating recalculation.
  // However, if we save the document directly, the 'save' hook fires.
  // If only specific fields are updated, it might be better to use findByIdAndUpdate
  // and rely on the findOneAnd hooks. For direct doc.save(), the 'save' hook is simpler.

  const updatedReview = await reviewDoc.save(); // Triggers 'save' hook

  // Alternative using findByIdAndUpdate (would trigger findOneAnd hooks):
  // const updatedReview = await Review.findByIdAndUpdate(reviewId, updateData, {
  //   new: true,
  //   runValidators: true,
  // });
  // if (!updatedReview) { // Should not happen if reviewDoc was found
  //   throw new AppError(`Review not found with ID: ${reviewId} during update.`, 404);
  // }

  logger.info(`Review ${reviewId} updated by user ${userId}.`);
  return updatedReview;
};

// @desc    Delete a review (by owner or Admin)
// @access  Private (Owner or Admin)
exports.deleteReview = async (reviewId, userId, userRole) => {
  const reviewDoc = await Review.findById(reviewId);
  if (!reviewDoc) {
    throw new AppError(`Review not found with ID: ${reviewId}`, 404);
  }

  // Check authorization
  if (reviewDoc.user._id.toString() !== userId.toString() && userRole !== 'admin') {
    throw new AppError('You are not authorized to delete this review.', 403);
  }

  // Using findByIdAndDelete will trigger the findOneAnd hooks for rating recalculation.
  const deletedReview = await Review.findByIdAndDelete(reviewId);
  if (!deletedReview) { // Should not happen if reviewDoc was found
     throw new AppError(`Review not found with ID: ${reviewId} during delete operation.`, 404);
  }

  logger.info(`Review ${reviewId} for product ${reviewDoc.product} deleted by user ${userId}.`);
  return { message: 'Review deleted successfully' };
};


// Helper function (example, if needed for "verified purchase" logic)
// async function checkIfUserPurchasedProduct(userId, productId) {
//   const Order = require('./Order'); // Avoid circular dependency if possible, or structure differently
//   const order = await Order.findOne({
//     user: userId,
//     'orderItems.product': productId,
//     isPaid: true, // Or orderStatus indicating completion
//   });
//   return !!order;
// }
