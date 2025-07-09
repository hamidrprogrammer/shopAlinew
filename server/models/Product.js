const mongoose = require('mongoose');
const slugify = require('slugify');
// const shortid = require('shortid'); // Optional: For generating unique SKUs

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Product name must be at least 3 characters long'],
      maxlength: [150, 'Product name cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    sku: {
      // Stock Keeping Unit
      type: String,
      unique: true,
      trim: true,
      // default: () => `SKU-${shortid.generate()}`, // Optional: auto-generate SKU
      // required: [true, 'SKU is required'], // Or make it auto-generated and always present
      maxlength: [50, 'SKU cannot exceed 50 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    shortDescription: { // For list views or quick summaries
      type: String,
      trim: true,
      maxlength: [250, 'Short description cannot exceed 250 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
      // Consider using mongoose-currency for more complex currency handling if needed
    },
    salePrice: { // Optional: For discounted price
      type: Number,
      min: [0, 'Sale price cannot be negative'],
      validate: {
        validator: function(value) {
          // Sale price should be less than regular price if provided
          return value === null || value === undefined || value < this.price;
        },
        message: 'Sale price must be less than the regular price.',
      },
    },
    // category: { // Single category assignment
    //   type: mongoose.Schema.ObjectId,
    //   ref: 'Category',
    //   required: [true, 'Product must belong to a category'],
    // },
    categories: [ // Multiple category assignment
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
      }
    ],
    brand: { // Optional: Product brand
      type: String, // Or mongoose.Schema.ObjectId, ref: 'Brand' if you have a Brand model
      trim: true,
      maxlength: [50, 'Brand name cannot exceed 50 characters'],
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity cannot be negative'],
      default: 0,
    },
    // Attributes like color, material, size. Can be simple strings or more complex objects.
    // This is a flexible way to store attributes.
    // For more structured attributes, you might define specific paths or an array of objects with key-value pairs.
    attributes: [
        {
            name: { type: String, required: true, trim: true }, // e.g., 'Color', 'Material', 'Dimensions'
            value: { type: String, required: true, trim: true }  // e.g., 'Red', 'Oak Wood', '120x60x75 cm'
        }
    ],
    // More specific attributes if consistently present across products:
    // color: { type: String, trim: true },
    // material: { type: String, trim: true },
    // dimensions: { // Example structured dimensions
    //   lengthCM: Number,
    //   widthCM: Number,
    //   heightCM: Number,
    //   weightKG: Number,
    // },
    images: [ // Array of image URLs
      {
        url: { type: String, required: true },
        altText: { type: String, trim: true, default: '' },
        isPrimary: { type: Boolean, default: false } // To mark the main display image
      }
    ],
    // For 3D models or 360 views
    // threeDModelUrl: { type: String },
    // thirtySixtyImageUrl: { type: String },

    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be between 0 and 5'],
      max: [5, 'Rating must be between 0 and 5'],
      set: (val) => Math.round(val * 10) / 10, // Rounds to one decimal place e.g. 4.666 -> 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    // reviews: [ // This is usually handled by a separate Review model that references the Product
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Review'
    //   }
    // ],
    tags: [String], // For searchable tags like 'modern', 'minimalist', 'eco-friendly'

    // Shipping related information (can be in a sub-document)
    // shippingDetails: {
    //   weight: Number, // in kg
    //   dimensions: { length: Number, width: Number, height: Number }, // in cm
    //   shippingClass: String, // e.g., 'standard', 'oversized'
    // },

    isPublished: { // To control visibility in the store
      type: Boolean,
      default: true,
    },
    isFeatured: { // To mark product as featured
      type: Boolean,
      default: false,
    },
    // Other meta fields
    // metaTitle: String,
    // metaDescription: String,
    // metaKeywords: [String],

    // Optional: for managing variants (e.g., a sofa in different colors/fabrics)
    // This can be complex. Simpler approach is separate products.
    // Or a parent product with child "variant" products.
    // variants: [
    //   {
    //     sku: String,
    //     attributes: [{ name: String, value: String }], // e.g., { name: 'Color', value: 'Blue' }
    //     price: Number, // Can override parent price
    //     stockQuantity: Number,
    //     images: [String]
    //   }
    // ],
    // parentProduct: { // If this is a variant, link to parent
    //   type: mongoose.Schema.ObjectId,
    //   ref: 'Product',
    //   default: null
    // }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- HOOKS ---

// Pre-save hook to generate slug from name
productSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = slugify(this.name, { lower: true, strict: true, trim: true });
  }
  next();
});

// Pre-save hook to ensure at least one category is assigned if using 'categories' array
productSchema.pre('save', function(next) {
  if (this.categories && this.categories.length === 0) {
    // return next(new Error('Product must belong to at least one category.'));
    // Or handle differently, e.g., assign a default "Uncategorized" category if one exists.
    // For now, we'll allow it to be empty, validation should be in service/controller or Zod.
  }
  // Ensure primary image logic (e.g., only one primary image)
  if (this.images && this.images.length > 0) {
    const primaryImages = this.images.filter(img => img.isPrimary === true);
    if (primaryImages.length > 1) {
      return next(new Error('A product can have only one primary image.'));
    }
    if (primaryImages.length === 0) {
        // If no primary image is set, and there are images, set the first one as primary.
        // This is an opinionated choice, adjust as needed.
        // this.images[0].isPrimary = true;
    }
  }
  next();
});

// --- INDEXES ---
productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' }); // For text search
productSchema.index({ price: 1, ratingsAverage: -1 });
productSchema.index({ categories: 1 });
productSchema.index({ isPublished: 1, isFeatured: 1 });

// --- VIRTUALS ---
// Example: Virtual for discounted percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.price && this.salePrice && this.salePrice < this.price) {
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
  }
  return 0;
});

// Virtual to populate reviews (if you have a separate Review model)
// productSchema.virtual('reviewsData', {
//   ref: 'Review',
//   foreignField: 'product', // field in Review model that stores product ID
//   localField: '_id' // field in Product model
// });


// --- METHODS ---
// Example: Method to check if product is in stock
// productSchema.methods.isInStock = function() {
//   return this.stockQuantity > 0;
// };


const Product = mongoose.model('Product', productSchema);

module.exports = Product;
