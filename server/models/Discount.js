const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Discount code is required.'],
      unique: true,
      trim: true,
      uppercase: true, // Standardize discount codes to uppercase
      minlength: [3, 'Discount code must be at least 3 characters long.'],
      maxlength: [30, 'Discount code cannot exceed 30 characters.'],
    },
    description: { // Optional description for admin reference
        type: String,
        trim: true,
        maxlength: [255, 'Description cannot exceed 255 characters.']
    },
    discountType: {
      type: String,
      required: true,
      enum: ['percentage', 'fixed_amount'], // Percentage off or fixed amount off
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required.'],
      min: [0, 'Discount value cannot be negative.'],
      validate: {
        validator: function(value) {
          if (this.discountType === 'percentage') {
            return value > 0 && value <= 100; // Percentage between 0 (exclusive) and 100 (inclusive)
          }
          return value > 0; // Fixed amount must be greater than 0
        },
        message: props => {
          if (props.path === 'discountValue' && this.discountType === 'percentage') {
            return 'Percentage discount must be between 1 and 100.';
          }
          return 'Discount value must be a positive number.';
        }
      }
    },
    isActive: { // To enable/disable the discount code
      type: Boolean,
      default: true,
    },
    startDate: { // When the discount becomes active
      type: Date,
      default: Date.now,
    },
    endDate: { // When the discount expires (optional, can be null for no expiry)
      type: Date,
      validate: {
          validator: function(value) {
              // If endDate is provided, it must be after startDate
              return !value || !this.startDate || value > this.startDate;
          },
          message: 'End date must be after the start date.'
      }
    },
    minimumPurchaseAmount: { // Minimum cart subtotal required to apply the discount
      type: Number,
      default: 0,
      min: [0, 'Minimum purchase amount cannot be negative.'],
    },
    usageLimit: { // Maximum number of times this discount can be used in total (e.g., first 100 customers)
      type: Number,
      min: [1, 'Usage limit must be at least 1.'], // If set, must be at least 1
      default: null, // Null means unlimited uses
    },
    timesUsed: { // How many times this discount has been used
      type: Number,
      default: 0,
    },
    // Restrictions:
    // specificUser: { // If the discount is for a specific user
    //   type: mongoose.Schema.ObjectId,
    //   ref: 'User',
    //   default: null, // Null means applicable to any user
    // },
    // usageLimitPerUser: { // Max times a single user can use this code
    //   type: Number,
    //   min: [1, 'Usage limit per user must be at least 1.'],
    //   default: 1, // Default to 1 if per-user limit is a concept
    // },
    applicableTo: { // What the discount applies to
        type: String,
        enum: ['all_products', 'specific_products', 'specific_categories'],
        default: 'all_products',
    },
    applicableProductIds: [{ // Array of Product ObjectIds if applicableTo is 'specific_products'
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
    }],
    applicableCategoryIds: [{ // Array of Category ObjectIds if applicableTo is 'specific_categories'
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
    }],
    // combineWithOtherDiscounts: { // Whether this discount can be combined with others
    //     type: Boolean,
    //     default: false,
    // }
  },
  {
    timestamps: true,
  }
);

// --- VIRTUALS ---
// Virtual to check if discount is currently valid (active, within date range, not exceeded usage limit)
discountSchema.virtual('isValid').get(function() {
  const now = new Date();
  if (!this.isActive) return false;
  if (this.startDate > now) return false;
  if (this.endDate && this.endDate < now) return false;
  if (this.usageLimit !== null && this.timesUsed >= this.usageLimit) return false;
  return true;
});

// --- INDEXES ---
discountSchema.index({ code: 1 });
discountSchema.index({ isActive: 1, startDate: 1, endDate: 1 });


// --- METHODS ---
// Method to increment timesUsed (could be part of a service layer too)
// discountSchema.methods.incrementUsage = async function() {
//   if (this.usageLimit === null || this.timesUsed < this.usageLimit) {
//     this.timesUsed += 1;
//     await this.save();
//     return true;
//   }
//   return false; // Could not increment, limit reached
// };

const Discount = mongoose.model('Discount', discountSchema);

module.exports = Discount;
