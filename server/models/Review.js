const mongoose = require('mongoose');
const Product = require('./Product'); // Required for updating product ratings

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review text cannot be empty.'],
      trim: true,
      minlength: [10, 'Review must be at least 10 characters long.'],
      maxlength: [1000, 'Review cannot exceed 1000 characters.'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1.'],
      max: [5, 'Rating must be at most 5.'],
      required: [true, 'Please provide a rating between 1 and 5.'],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
    // Optional fields:
    // title: { type: String, trim: true, maxlength: 100 },
    // isApproved: { type: Boolean, default: true } // If admin approval is needed
    // helpfulVotes: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- INDEXES ---
// Compound index to prevent a user from writing multiple reviews for the same product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1 });
reviewSchema.index({ user: 1 });

// --- STATIC METHODS ---
// Static method to calculate average ratings and quantity for a product
reviewSchema.statics.calculateAverageRatings = async function(productId) {
  // 'this' points to the current model (Review)
  const stats = await this.aggregate([
    {
      $match: { product: productId } // Filter reviews for the given product
    },
    {
      $group: {
        _id: '$product', // Group by product ID
        numRatings: { $sum: 1 }, // Count number of ratings
        avgRating: { $avg: '$rating' } // Calculate average rating
      }
    }
  ]);

  // console.log(`Stats for product ${productId}:`, stats);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: stats[0].numRatings,
      ratingsAverage: Math.round(stats[0].avgRating * 10) / 10 // Round to one decimal place
    });
  } else {
    // If no reviews, reset ratings on product
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 0 // Or a default like 0 or null based on preference
    });
  }
};

// --- HOOKS (MIDDLEWARE) ---

// Call calculateAverageRatings after a new review is saved
reviewSchema.post('save', function() {
  // 'this' points to the current review document
  // this.constructor points to the Model (Review)
  this.constructor.calculateAverageRatings(this.product);
});

// Call calculateAverageRatings when a review is updated or deleted
// For findByIdAndUpdate and findByIdAndDelete, 'this' is the query, not the document.
// So, we need a workaround to get the document.
reviewSchema.pre(/^findOneAnd/, async function(next) {
  // Store the document that is being updated/deleted on the query object
  // So we can access it in the post hook.
  // findOne() gets the document before the update/delete operation.
  this.r = await this.model.findOne(this.getQuery()).clone(); // Use model.findOne and clone()
  // console.log('Pre hook, found doc:', this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  // this.r is the document we stored in the pre hook
  // this.r will be null if the document was not found (e.g., already deleted)
  // The document 'this.r' holds the state *before* the update/delete.
  // If it was a delete, this.r.product is the productId.
  // If it was an update, this.r.product is also the productId.
  if (this.r) {
    // console.log('Post hook, doc from pre:', this.r);
    await this.r.constructor.calculateAverageRatings(this.r.product);
  }
});


// Populate user and product fields when finding reviews
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name email' // Select fields you want from User model
  });
  // Optionally populate product details, though often reviews are fetched in context of a product
  // this.populate({
  //   path: 'product',
  //   select: 'name slug'
  // });
  next();
});


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
