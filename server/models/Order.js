const mongoose = require('mongoose');
// const shortid = require('shortid'); // For generating human-readable order numbers

// Schema for individual items within an order
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Order item must reference a product.'],
    },
    name: { // Denormalized from Product for historical record keeping
      type: String,
      required: true,
    },
    sku: { // Denormalized from Product
        type: String,
        required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1.'],
    },
    price: { // Price per unit at the time of order (denormalized)
      type: Number,
      required: true,
    },
    image: { // Main image of the product (denormalized)
        type: String
    }
    // Potentially add selected attributes/variants if applicable
    // attributes: [{ name: String, value: String }]
  },
  { _id: false } // No separate _id for subdocuments unless needed
);

const orderSchema = new mongoose.Schema(
  {
    // Consider using a more user-friendly order number generator if needed
    // orderNumber: {
    //   type: String,
    //   unique: true,
    //   default: () => `ORD-${shortid.generate()}`
    // },
    user: { // The user who placed the order
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user.'],
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: [true, "Full name is required for shipping."] },
      address: { type: String, required: [true, "Street address is required for shipping."] },
      city: { type: String, required: [true, "City is required for shipping."] },
      postalCode: { type: String, required: [true, "Postal code is required for shipping."] },
      country: { type: String, required: [true, "Country is required for shipping."] },
      phoneNumber: { type: String, required: [true, "Phone number is required for shipping."]}, // For delivery contact
    },
    // Optional: Separate billing address if different from shipping
    // billingAddress: { ... },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required.'],
      enum: ['stripe', 'paypal', 'iyzico', 'cash_on_delivery', 'bank_transfer'], // Example methods
      default: 'stripe',
    },
    paymentResult: { // Information from payment gateway
      id: String, // Transaction ID from gateway
      status: String, // e.g., 'succeeded', 'pending', 'failed'
      update_time: String, // Timestamp from gateway
      email_address: String, // Payer's email from gateway
    },
    itemsPrice: { // Subtotal of all items
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: { // Grand total (itemsPrice + taxPrice + shippingPrice)
      type: Number,
      required: true,
      default: 0.0,
    },
    orderStatus: {
      type: String,
      required: true,
      enum: [
        'Pending',        // Order placed, awaiting payment or processing
        'Payment Failed',
        'Processing',     // Payment received, order is being prepared
        'Shipped',        // Order handed over to courier
        'Out For Delivery', // Order is with the delivery personnel
        'Delivered',      // Order successfully delivered
        'Cancelled',      // Order cancelled by user or admin
        'Refunded',       // Order refunded
        'On Hold'         // Order on hold due to an issue
      ],
      default: 'Pending',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: { // A simple flag, or use orderStatus 'Delivered'
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    // Optional fields
    // discountCode: String,
    // discountAmount: Number,
    // notes: String, // Customer notes
    // trackingNumber: String,
    // shippingCarrier: String,
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// --- INDEXES ---
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ isPaid: 1 });
// orderSchema.index({ orderNumber: 1 }, { unique: true }); // If using orderNumber

// --- VIRTUALS ---
// Example: if you generate an order number and want it easily accessible
// orderSchema.virtual('displayId').get(function() {
//   return this.orderNumber || this._id.toString().slice(-6).toUpperCase();
// });

// --- PRE-SAVE HOOKS ---
// Calculate prices before saving (if not already calculated on client/service)
// This is a simple example; tax and shipping can be complex.
orderSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('orderItems') || this.isModified('shippingPrice') || this.isModified('taxPrice')) {
    this.itemsPrice = this.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Basic tax calculation (e.g., 10% of itemsPrice) - This should be configurable
    // this.taxPrice = Math.round(this.itemsPrice * 0.10 * 100) / 100;

    this.totalPrice = Math.round((this.itemsPrice + this.shippingPrice + this.taxPrice) * 100) / 100;
  }
  next();
});

// --- METHODS ---
// Example: Mark order as paid
// orderSchema.methods.markAsPaid = function(paymentResult) {
//   this.isPaid = true;
//   this.paidAt = Date.now();
//   this.paymentResult = paymentResult;
//   this.orderStatus = 'Processing'; // Or based on payment gateway confirmation
//   return this.save();
// };


const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
