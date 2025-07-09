const mongoose = require('mongoose');
const slugify = require('slugify'); // Will need to install this package

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A category must have a name'],
      unique: true,
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters long'],
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      unique: true, // Slugs must be unique
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    image: {
      // URL to the category image, typically hosted on Cloudinary or S3
      type: String,
      // validate: { // Example validation for URL
      //   validator: (value) => /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value),
      //   message: 'Please provide a valid URL for the image'
      // }
    },
    parent: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category', // Self-referencing for parent category
      default: null, // Root categories have no parent
    },
    // Ancestors array for easier querying of hierarchical data (Materialized Path pattern)
    // Stores an array of parent category objects or just their IDs and names for quick lookup.
    // Example: [{ _id: 'parentId1', name: 'Parent 1', slug: 'parent-1' }, { _id: 'grandparentId1', name: 'Grandparent 1', slug: 'grandparent-1' }]
    // Or simpler: [parentId1, grandparentId1]
    ancestors: [
      {
        _id: {
          type: mongoose.Schema.ObjectId,
          ref: 'Category',
        },
        name: String,
        slug: String,
      },
    ],
    // isActive: { // Optional: for soft deleting categories
    //   type: Boolean,
    //   default: true,
    //   select: false
    // }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- HOOKS (MIDDLEWARE) ---

// Pre-save hook to generate slug from name before saving
categorySchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = slugify(this.name, { lower: true, strict: true, trim: true });
  }
  next();
});

// Pre-save hook to build the ancestors path if a parent is set
// This helps in efficiently querying all descendants of a category or breadcrumbs.
categorySchema.pre('save', async function (next) {
  if (this.isModified('parent') || this.isNew) {
    if (this.parent) {
      const parentCategory = await mongoose.model('Category').findById(this.parent).select('name slug ancestors');
      if (parentCategory) {
        const newAncestors = [
          ...(parentCategory.ancestors || []), // Get parent's ancestors
          { _id: parentCategory._id, name: parentCategory.name, slug: parentCategory.slug } // Add parent itself
        ];
        this.ancestors = newAncestors;
      } else {
        // Parent category not found, perhaps clear parent or throw error
        this.parent = null;
        this.ancestors = [];
        // return next(new Error('Parent category not found.')); // Or handle as per your logic
      }
    } else {
      this.ancestors = []; // No parent, so no ancestors
    }
  }
  next();
});


// --- VIRTUALS ---
// Example: Virtual for children (subcategories) - can be performance intensive if not used carefully
// categorySchema.virtual('children', {
//   ref: 'Category',
//   localField: '_id',
//   foreignField: 'parent'
// });

// --- INDEXES ---
// Index for common query fields
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ 'ancestors._id': 1 }); // Index on ancestor IDs for faster lookup of descendants

// Optional: Text index for searching
// categorySchema.index({ name: 'text', description: 'text' });


// --- METHODS ---
// Example: Method to get all sub-categories (recursively or just direct children)
// categorySchema.methods.getSubcategories = async function() {
//   // This would find direct children. Recursive would be more complex.
//   return await mongoose.model('Category').find({ parent: this._id });
// };


const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
