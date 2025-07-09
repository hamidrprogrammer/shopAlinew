const categoryService = require('../services/categoryService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// @desc    Create a new category
// @route   POST /api/v1/categories
// @access  Private/Admin
exports.createCategory = catchAsync(async (req, res, next) => {
  // Data for new category will be in req.body
  // Basic validation can be done here, or more robustly with Zod in middleware
  const { name, description, parent, image } = req.body;
  if (!name) {
    return next(new AppError('Category name is required.', 400));
  }

  const newCategory = await categoryService.createCategory({
    name,
    description,
    parent, // Will be null if not provided
    image,
  });

  logger.info(`Category created: ${newCategory.name} (ID: ${newCategory._id}) by user ${req.user ? req.user.id : 'Unknown'}`);
  res.status(201).json({
    status: 'success',
    message: 'Category created successfully',
    data: {
      category: newCategory,
    },
  });
});

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
exports.getAllCategories = catchAsync(async (req, res, next) => {
  // req.query will be used by APIFeatures in the service
  const categories = await categoryService.getAllCategories(req.query);

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: {
      categories,
    },
  });
});

// @desc    Get a single category by ID or Slug
// @route   GET /api/v1/categories/:idOrSlug
// @access  Public
exports.getCategory = catchAsync(async (req, res, next) => {
  const { idOrSlug } = req.params;
  const category = await categoryService.getCategoryByIdOrSlug(idOrSlug);

  // No need to check if (!category) here, service throws AppError if not found

  res.status(200).json({
    status: 'success',
    data: {
      category,
    },
  });
});

// @desc    Update a category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
exports.updateCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body; // { name, description, parent, image }

  if (Object.keys(updateData).length === 0) {
    return next(new AppError('No data provided for update.', 400));
  }

  const updatedCategory = await categoryService.updateCategory(id, updateData);

  logger.info(`Category updated: ${updatedCategory.name} (ID: ${updatedCategory._id}) by user ${req.user ? req.user.id : 'Unknown'}`);
  res.status(200).json({
    status: 'success',
    message: 'Category updated successfully',
    data: {
      category: updatedCategory,
    },
  });
});

// @desc    Delete a category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
exports.deleteCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await categoryService.deleteCategory(id);

  logger.info(`Category deleted: (ID: ${id}) by user ${req.user ? req.user.id : 'Unknown'}`);
  res.status(204).json({ // 204 No Content for successful deletion
    status: 'success',
    data: null, // No data to send back
  });
});


// --- Additional potential controllers for hierarchical data ---

// @desc    Get category tree (all categories structured hierarchically)
// @route   GET /api/v1/categories/tree
// @access  Public
// exports.getCategoryTree = catchAsync(async (req, res, next) => {
//   const categoryTree = await categoryService.getCategoryTree(); // Assuming this service method exists
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tree: categoryTree,
//     },
//   });
// });

// @desc    Get descendants of a category
// @route   GET /api/v1/categories/:id/descendants
// @access  Public
// exports.getDescendantCategories = catchAsync(async (req, res, next) => {
//   const { id } = req.params;
//   const descendants = await categoryService.getDescendantCategories(id); // Assuming this service method exists
//   res.status(200).json({
//     status: 'success',
//     results: descendants.length,
//     data: {
//       descendants,
//     },
//   });
// });

// @desc    Get children of a category (direct subcategories)
// @route   GET /api/v1/categories/:id/children
// @access  Public
// exports.getChildCategories = catchAsync(async (req, res, next) => {
//   const { id } = req.params;
//   // This can be done by using getAllCategories with a filter
//   const children = await categoryService.getAllCategories({ parent: id, ...req.query });
//   res.status(200).json({
//     status: 'success',
//     results: children.length,
//     data: {
//       children,
//     },
//   });
// });
