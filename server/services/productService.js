const Product = require('../models/Product');
const Category = require('../models/Category'); // Needed for validating category existence
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const logger = require('../utils/logger');
// const shortid = require('shortid'); // If using for SKU generation

// @desc    Create a new product
// @access  Admin
exports.createProduct = async (productData) => {
  // Validate categories: ensure all provided category IDs exist
  if (productData.categories && productData.categories.length > 0) {
    const foundCategories = await Category.find({ _id: { $in: productData.categories } });
    if (foundCategories.length !== productData.categories.length) {
      const notFoundIds = productData.categories.filter(catId => !foundCategories.find(fc => fc._id.toString() === catId.toString()));
      throw new AppError(`One or more categories not found: ${notFoundIds.join(', ')}`, 404);
    }
  } else {
    // Depending on requirements, you might want to enforce at least one category
    // Or assign a default "Uncategorized" category if none provided and such a category exists.
    // For now, allowing products without categories, or this check can be in Zod.
  }

  // Generate SKU if not provided (example)
  if (!productData.sku) {
    // A simple SKU generation strategy. Replace with a more robust one if needed.
    // For example, combining parts of name, brand, and a random string, or using shortid.
    // productData.sku = `SKU-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    // For now, assuming SKU is provided or handled by Zod validation (e.g. required)
    if (typeof productData.name === 'string' && productData.name.length > 3) {
         productData.sku = `SKU-${productData.name.substring(0,3).toUpperCase()}-${Date.now().toString(36).slice(-4)}`;
    } else {
        productData.sku = `SKU-PROD-${Date.now().toString(36).slice(-6)}`;
    }
    logger.info(`Generated SKU for new product: ${productData.sku}`);
  } else {
     // Check if SKU already exists
    const existingSku = await Product.findOne({ sku: productData.sku });
    if (existingSku) {
        throw new AppError(`Product with SKU "${productData.sku}" already exists.`, 409);
    }
  }


  // Handle primary image logic: if no primary image set and images exist, set the first one as primary.
  // This can also be done in the model's pre-save hook.
  if (productData.images && productData.images.length > 0) {
    const hasPrimary = productData.images.some(img => img.isPrimary === true);
    if (!hasPrimary) {
      productData.images[0].isPrimary = true;
    }
  }

  const newProduct = await Product.create(productData);
  return newProduct;
};

// @desc    Get all products
// @access  Public
exports.getAllProducts = async (queryParams) => {
  let query = Product.find();

  // Populate categories. Can be made conditional.
  if (queryParams.populate_categories !== 'false') {
    query = query.populate({
      path: 'categories',
      select: 'name slug image', // Select fields you need from category
    });
  }

  // Apply APIFeatures
  const features = new APIFeatures(query, queryParams)
    .filter() // e.g., ?price[lte]=500&categories[in]=catId1,catId2&isPublished=true
    .sort()   // e.g., ?sort=-price,name
    .limitFields() // e.g., ?fields=name,price,slug,images
    .paginate(); // e.g., ?page=1&limit=12

  const products = await features.query;

  // If you need total count for pagination on client-side (without making another request)
  // You can modify APIFeatures or do it here.
  // const totalProducts = await Product.countDocuments(features.mongooseQuery.getFilter()); // Get filter from Mongoose query object

  return products; // { products, totalProducts (optional) }
};

// @desc    Get a single product by ID or Slug
// @access  Public
exports.getProductByIdOrSlug = async (identifier, queryParams = {}) => {
  let productQuery;

  if (identifier.match(/^[0-9a-fA-F]{24}$/)) { // Check if it's a MongoDB ObjectId
    productQuery = Product.findById(identifier);
  } else {
    productQuery = Product.findOne({ slug: identifier });
  }

  // Populate categories
   if (queryParams.populate_categories !== 'false') {
    productQuery = productQuery.populate({
      path: 'categories',
      select: 'name slug image',
    });
  }

  // TODO: Populate reviews if implementing review system
  // productQuery = productQuery.populate('reviewsData'); // Assuming virtual 'reviewsData'

  const product = await productQuery;

  if (!product) {
    throw new AppError(`Product not found with identifier: ${identifier}`, 404);
  }
  // Only return published products to general users, unless specifically requested by admin
  // This logic might be better in the controller or via query filter for admins
  // if (!product.isPublished && !(queryParams.show_unpublished === 'true' && req.user && req.user.role === 'admin')) {
  //    throw new AppError(`Product not found or not available.`, 404);
  // }

  return product;
};

// @desc    Update a product
// @access  Admin
exports.updateProduct = async (productId, updateData) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError(`Product not found with ID: ${productId}`, 404);
  }

  // Validate categories if being updated
  if (updateData.categories && updateData.categories.length > 0) {
    const foundCategories = await Category.find({ _id: { $in: updateData.categories } });
    if (foundCategories.length !== updateData.categories.length) {
        const notFoundIds = updateData.categories.filter(catId => !foundCategories.find(fc => fc._id.toString() === catId.toString()));
        throw new AppError(`One or more categories not found: ${notFoundIds.join(', ')}`, 404);
    }
  }

  // Prevent changing SKU directly to avoid conflicts, or handle carefully
  if (updateData.sku && updateData.sku !== product.sku) {
    const existingSku = await Product.findOne({ sku: updateData.sku });
    if (existingSku && existingSku._id.toString() !== productId) {
        throw new AppError(`Another product with SKU "${updateData.sku}" already exists.`, 409);
    }
  }

  // Handle primary image logic if images are updated
  if (updateData.images && updateData.images.length > 0) {
    const hasPrimary = updateData.images.some(img => img.isPrimary === true);
    if (!hasPrimary) {
      updateData.images[0].isPrimary = true;
    }
  }

  // Update product fields
  // Name change will trigger slug update via pre-save hook
  Object.keys(updateData).forEach(key => {
    product[key] = updateData[key];
  });

  const updatedProduct = await product.save();
  return updatedProduct;
};

// @desc    Delete a product
// @access  Admin
exports.deleteProduct = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError(`Product not found with ID: ${productId}`, 404);
  }

  // TODO: Add checks before deletion, e.g., if product is in active orders.
  // This might involve soft delete (setting an `isDeleted` flag) rather than hard delete.

  await product.deleteOne();
  return { message: 'Product deleted successfully' };
};


// --- Additional potential services ---

// @desc    Get products by category slug or ID
// exports.getProductsByCategory = async (categoryIdentifier, queryParams) => {
//   let category = await Category.findOne(
//     categoryIdentifier.match(/^[0-9a-fA-F]{24}$/) ? { _id: categoryIdentifier } : { slug: categoryIdentifier }
//   );
//   if (!category) {
//     throw new AppError(`Category not found: ${categoryIdentifier}`, 404);
//   }
//   // Find products that include this category in their 'categories' array
//   const features = new APIFeatures(Product.find({ categories: category._id }), queryParams)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const products = await features.query.populate('categories', 'name slug');
//   return products;
// };

// @desc    Update product stock (e.g., after an order)
// exports.updateStock = async (productId, quantityChange) => {
//   const product = await Product.findById(productId);
//   if (!product) throw new AppError('Product not found', 404);
//   product.stockQuantity += quantityChange; // quantityChange can be negative
//   if (product.stockQuantity < 0) throw new AppError('Stock cannot be negative', 400);
//   await product.save({ validateBeforeSave: false }); // Skip full validation for stock update
//   return product;
// };

// @desc    Get featured products
// exports.getFeaturedProducts = async (queryParams) => {
//   const features = new APIFeatures(Product.find({ isFeatured: true, isPublished: true }), queryParams)
//     .sort() // e.g. sort by -createdAt or a specific featuredOrder field
//     .limitFields()
//     .paginate(); // Limit number of featured products
//   const products = await features.query.populate('categories', 'name slug');
//   return products;
// };
