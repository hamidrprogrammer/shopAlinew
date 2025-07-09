const productService = require('../services/productService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// @desc    Create a new product
// @route   POST /api/v1/products
// @access  Private/Admin
exports.createProduct = catchAsync(async (req, res, next) => {
  // Data for new product will be in req.body
  // More robust validation will be handled by Zod middleware
  // Basic check:
  if (!req.body.name || !req.body.description || !req.body.price || !req.body.stockQuantity) {
    return next(new AppError('Missing required product fields: name, description, price, stockQuantity.', 400));
  }

  const newProduct = await productService.createProduct(req.body);

  logger.info(`Product created: ${newProduct.name} (ID: ${newProduct._id}, SKU: ${newProduct.sku}) by user ${req.user ? req.user.id : 'Unknown'}`);
  res.status(201).json({
    status: 'success',
    message: 'Product created successfully',
    data: {
      product: newProduct,
    },
  });
});

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
exports.getAllProducts = catchAsync(async (req, res, next) => {
  // req.query will be used by APIFeatures in the service
  const products = await productService.getAllProducts(req.query);

  res.status(200).json({
    status: 'success',
    results: products.length, // This might be the length of the current page, not total results.
                              // Consider returning total count from service if pagination is used.
    data: {
      products,
    },
  });
});

// @desc    Get a single product by ID or Slug
// @route   GET /api/v1/products/:idOrSlug
// @access  Public
exports.getProduct = catchAsync(async (req, res, next) => {
  const { idOrSlug } = req.params;
  const product = await productService.getProductByIdOrSlug(idOrSlug, req.query);

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

// @desc    Update a product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
exports.updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  if (Object.keys(updateData).length === 0) {
    return next(new AppError('No data provided for update.', 400));
  }

  const updatedProduct = await productService.updateProduct(id, updateData);

  logger.info(`Product updated: ${updatedProduct.name} (ID: ${updatedProduct._id}) by user ${req.user ? req.user.id : 'Unknown'}`);
  res.status(200).json({
    status: 'success',
    message: 'Product updated successfully',
    data: {
      product: updatedProduct,
    },
  });
});

// @desc    Delete a product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await productService.deleteProduct(id);

  logger.info(`Product deleted: (ID: ${id}) by user ${req.user ? req.user.id : 'Unknown'}`);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});


// --- Additional potential controllers ---

// @desc    Get products by category
// @route   GET /api/v1/categories/:categoryIdOrSlug/products  (Example of nested route)
// exports.getProductsByCategory = catchAsync(async (req, res, next) => {
//   const { categoryIdOrSlug } = req.params;
//   const products = await productService.getProductsByCategory(categoryIdOrSlug, req.query);
//   res.status(200).json({
//     status: 'success',
//     results: products.length,
//     data: {
//       products,
//     },
//   });
// });

// @desc    Get featured products
// @route   GET /api/v1/products/featured
// exports.getFeaturedProducts = catchAsync(async (req, res, next) => {
//    const products = await productService.getFeaturedProducts(req.query);
//    res.status(200).json({
//        status: 'success',
//        results: products.length,
//        data: {
//            products
//        }
//    });
// });

// Placeholder for image upload handling if done via product routes directly
// (Though typically image uploads might have their own controller/service or use Cloudinary direct from client)
// exports.uploadProductImages = catchAsync(async (req, res, next) => {
//   // ... logic for handling file uploads (e.g., with multer) and updating product.images
//   res.status(200).json({ status: 'success', message: 'Images uploaded' });
// });
