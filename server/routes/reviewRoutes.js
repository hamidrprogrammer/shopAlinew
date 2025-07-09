const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, createReviewSchema, updateReviewSchema } = require('../middleware/validationMiddleware');

// By setting mergeParams: true, this router will be able to access parameters
// from its parent router, e.g., :productId if mounted as /products/:productId/reviews
const router = express.Router({ mergeParams: true });

// --- Routes ---

// GET all reviews (e.g., for a specific product if nested, or all reviews if standalone)
// If mounted at /products/:productId/reviews, GET / will get reviews for that product.
// If mounted at /reviews, GET / will get all reviews (can be filtered by query params).
router.get('/', reviewController.getAllReviews);

// POST a new review (for a specific product if nested, or productId in body if standalone)
// User must be logged in to post a review.
router.post('/', protect, validate(createReviewSchema), reviewController.createReview);


// Routes for specific review by ID (e.g. /api/v1/reviews/:id)
// These are typically standalone, not nested under products.

// GET a single review by its ID
router.get('/:id', reviewController.getReviewById);

// PUT update a review (owner or admin)
// User must be logged in.
router.put('/:id', protect, validate(updateReviewSchema), reviewController.updateReview);

// DELETE a review (owner or admin)
// User must be logged in.
router.delete('/:id', protect, reviewController.deleteReview);


// --- Admin specific routes for reviews (if any beyond standard delete/update by admin) ---
// Example: Approve a review (if isApproved flag is used)
// router.patch('/:id/approve', protect, authorize('admin'), reviewController.approveReview);


module.exports = router;
