const Category = require('../models/Category');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures'); // Assuming this utility will be created for filtering, sorting, pagination

// @desc    Create a new category
// @access  Admin
exports.createCategory = async (categoryData) => {
  // Check if category with the same name already exists (slug will also be unique due to schema)
  const existingCategory = await Category.findOne({ name: categoryData.name });
  if (existingCategory) {
    throw new AppError(`Category with name "${categoryData.name}" already exists.`, 409); // Conflict
  }

  // If parent is provided, ensure it exists
  if (categoryData.parent) {
    const parentCategory = await Category.findById(categoryData.parent);
    if (!parentCategory) {
      throw new AppError(`Parent category with ID "${categoryData.parent}" not found.`, 404);
    }
  }

  const newCategory = await Category.create(categoryData);
  return newCategory;
};

// @desc    Get all categories
// @access  Public (or Admin, depending on use case)
exports.getAllCategories = async (queryParams) => {
  // Base query
  let query = Category.find();

  // Populate parent category details. Can be made conditional or configurable.
  if (queryParams.populate !== 'false') { // Example: allow disabling populate via ?populate=false
    query = query.populate({
        path: 'parent',
        select: 'name slug'
    });
    // Optionally populate ancestors too, if needed directly, though it can make responses large
    // query = query.populate({
    //     path: 'ancestors._id', // This assumes ancestors store just _id, or adjust path accordingly
    //     select: 'name slug'
    // });
  }

  const features = new APIFeatures(query, queryParams)
    .filter() // Apply general filters like ?name[regex]=someName&isActive=true
    .sort()   // Apply sorting like ?sort=name or ?sort=-createdAt
    .limitFields() // Apply field selection like ?fields=name,slug
    .paginate(); // Apply pagination like ?page=1&limit=10

  const categories = await features.query;

  // For specific hierarchical queries (like getting only top-level or children of a specific parent)
  // the `filter()` method in APIFeatures can be used if the queryParams are structured correctly.
  // e.g., ?parent=null for top-level, or ?parent=<parentId> for children.
  // The APIFeatures class will treat `parent=null` as `{"parent": null}` if `null` is a string.
  // If `null` is actual null, it works directly.
  // If queryParams.parent is 'null' (string), the filter in APIFeatures needs to handle it:
  // In APIFeatures.filter():
  // if (parsedQuery.parent === 'null') parsedQuery.parent = null;

  // To get a flat list (useful for admin panels or dropdowns)
  // The current implementation with APIFeatures already returns a flat list.

  // To get a nested tree structure (can be complex and resource-intensive for large datasets)
  // This would typically be handled by a separate function or client-side processing.
  // For example, a function to build a tree from a flat list:
  // const buildTree = (categories, parentId = null) => {
  //   return categories
  //     .filter(category => String(category.parent) === String(parentId) || (parentId === null && !category.parent))
  //     .map(category => ({ ...category.toObject(), children: buildTree(categories, category._id) }));
  // };
  // const allCategoriesFlat = await Category.find({}).sort('name');
  // const categoryTree = buildTree(allCategoriesFlat);
  // return categoryTree; // If returning a tree

  return categories; // Returning flat list for now
};

// @desc    Get a single category by ID or Slug
// @access  Public
exports.getCategoryByIdOrSlug = async (identifier) => {
  let category;
  // Check if identifier is a valid MongoDB ObjectId
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    category = await Category.findById(identifier).populate('parent', 'name slug');
  } else {
    // Assume it's a slug
    category = await Category.findOne({ slug: identifier }).populate('parent', 'name slug');
  }

  if (!category) {
    throw new AppError(`Category not found with identifier: ${identifier}`, 404);
  }
  return category;
};

// @desc    Update a category
// @access  Admin
exports.updateCategory = async (categoryId, updateData) => {
  // Find category by ID
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new AppError(`Category not found with ID: ${categoryId}`, 404);
  }

  // Check for name conflict if name is being changed
  if (updateData.name && updateData.name !== category.name) {
    const existingCategory = await Category.findOne({ name: updateData.name });
    if (existingCategory && existingCategory._id.toString() !== categoryId) {
      throw new AppError(`Another category with name "${updateData.name}" already exists.`, 409);
    }
  }

  // If parent is being changed, ensure the new parent exists and is not the category itself or one of its descendants
  if (updateData.parent && updateData.parent.toString() !== (category.parent ? category.parent.toString() : null)) {
    if (updateData.parent === categoryId) {
        throw new AppError('A category cannot be its own parent.', 400);
    }
    const newParentCategory = await Category.findById(updateData.parent);
    if (!newParentCategory) {
      throw new AppError(`New parent category with ID "${updateData.parent}" not found.`, 404);
    }
    // Check for circular dependency: new parent cannot be a descendant of the current category
    if (newParentCategory.ancestors && newParentCategory.ancestors.find(a => a._id.toString() === categoryId)) {
        throw new AppError('Cannot set parent to a descendant category (circular dependency).', 400);
    }
  } else if (updateData.parent === null && category.parent !== null) {
    // Explicitly setting parent to null (making it a root category)
    updateData.ancestors = []; // This will be handled by pre-save hook too, but good to be explicit
  }


  // Update fields
  // The 'slug' and 'ancestors' will be updated by pre-save hooks if 'name' or 'parent' changes.
  Object.keys(updateData).forEach(key => {
    category[key] = updateData[key];
  });

  const updatedCategory = await category.save(); // This will trigger pre-save hooks
  return updatedCategory;
};

// @desc    Delete a category
// @access  Admin
exports.deleteCategory = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new AppError(`Category not found with ID: ${categoryId}`, 404);
  }

  // Check if the category has any subcategories (children)
  const childCount = await Category.countDocuments({ parent: categoryId });
  if (childCount > 0) {
    throw new AppError(`Cannot delete category "${category.name}" because it has subcategories. Please delete or reassign them first.`, 400);
  }

  // TODO: Check if the category is associated with any products.
  // If so, either prevent deletion or handle unlinking/reassigning products.
  // Example:
  // const Product = require('./Product'); // Assuming Product model exists
  // const productCount = await Product.countDocuments({ category: categoryId });
  // if (productCount > 0) {
  //   throw new AppError(`Cannot delete category "${category.name}" as it's linked to products.`, 400);
  // }

  await category.deleteOne(); // or category.remove() in older mongoose
  return { message: 'Category deleted successfully' };
};


// --- Utility functions for hierarchical data (if needed) ---

// Example: Get all descendant categories of a given category ID
// exports.getDescendantCategories = async (categoryId) => {
//   return await Category.find({ 'ancestors._id': categoryId });
// };

// Example: Get category tree (can be resource-intensive)
// exports.getCategoryTree = async () => {
//   const allCategories = await Category.find({}).sort('name').lean(); // Use .lean() for performance with plain JS objects
//   const buildTree = (categories, parentId = null) => {
//     return categories
//       .filter(category => {
//         const pId = category.parent ? category.parent.toString() : null;
//         return pId === (parentId ? parentId.toString() : null);
//       })
//       .map(category => ({ ...category, children: buildTree(categories, category._id) }));
//   };
//   return buildTree(allCategories);
// };
