const express = require('express');
const categoryController = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Removed isAdmin as we use authorize directly
const { validate, createCategorySchema, updateCategorySchema } = require('../middleware/validationMiddleware');

const router = express.Router();

// --- Public Routes ---
// Get all categories (can be filtered, sorted, paginated via query params)
router.get('/', categoryController.getAllCategories);

// Get a single category by ID or Slug
router.get('/:idOrSlug', categoryController.getCategory);


// --- Special Public Routes for Hierarchical Data (Examples) ---
// These would need corresponding service and controller methods if activated.
// router.get('/tree', categoryController.getCategoryTree); // Get full category tree
// router.get('/:id/children', categoryController.getChildCategories); // Get direct children of a category
// router.get('/:id/descendants', categoryController.getDescendantCategories); // Get all descendants


// --- Protected Admin Routes ---
// All routes below this point require admin privileges.
// We can use authorize('admin') or a dedicated isAdmin middleware.
// If isAdmin is not defined as authorize('admin'), you can define it or use authorize directly.
// For simplicity, let's assume isAdmin = authorize('admin') or similar.
// If you only have protect and authorize: router.use(protect, authorize('admin'));

// To protect all subsequent routes in this router for admins:
router.use(protect); // User must be logged in
router.use(authorize('admin')); // User must be an admin

// Create a new category
router.post('/', validate(createCategorySchema), categoryController.createCategory);

// Update a category by ID
router.put('/:id', validate(updateCategorySchema), categoryController.updateCategory);

// Delete a category by ID
router.delete('/:id', categoryController.deleteCategory);


module.exports = router;
