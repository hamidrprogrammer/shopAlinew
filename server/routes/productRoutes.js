const express = require('express');
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, createProductSchema, updateProductSchema } = require('../middleware/validationMiddleware');

// Nested route for reviews
const reviewRouter = require('./reviewRoutes'); // Import review router

const router = express.Router();

// --- Public Routes ---
// Get all products (filtered, sorted, paginated via query params)
router.get('/', productController.getAllProducts);

// Get a single product by ID or Slug
router.get('/:idOrSlug', productController.getProduct);

// Example: Route for featured products
// router.get('/featured', productController.getFeaturedProducts); // This needs to be defined before /:idOrSlug

// --- Nested Routes ---
// Example: GET /api/v1/products/:productId/reviews  (To get all reviews for a product)
// POST /api/v1/products/:productId/reviews (To create a review for a product)
router.use('/:productId/reviews', reviewRouter); // Mount reviewRouter for nested routes


// --- Protected Admin Routes ---
router.use(protect);
router.use(authorize('admin')); // Only admins can create, update, delete products

// Create a new product
router.post('/', validate(createProductSchema), productController.createProduct);

// Update a product by ID
router.put('/:id', validate(updateProductSchema), productController.updateProduct);

// Delete a product by ID
router.delete('/:id', productController.deleteProduct);

// Example route for uploading product images (if handled by this router)
// This would typically use multer middleware for file handling.
// router.post('/:id/images', productController.uploadProductImages);


module.exports = router;
