const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User', // Reference to the admin user who performed the action
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      enum: [ // Example actions, can be expanded
        'CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT',
        'CREATE_CATEGORY', 'UPDATE_CATEGORY', 'DELETE_CATEGORY',
        'UPDATE_ORDER_STATUS', 'DELETE_ORDER',
        'UPDATE_USER_ROLE', 'BLOCK_USER', 'UNBLOCK_USER', 'DELETE_USER_ADMIN',
        'CREATE_DISCOUNT', 'UPDATE_DISCOUNT', 'DELETE_DISCOUNT',
        'UPDATE_SETTINGS',
        'APPROVE_REVIEW', 'DELETE_REVIEW_ADMIN',
        // Add more specific actions as needed
      ],
    },
    entity: { // The type of entity that was affected
      type: String,
      trim: true,
      // Example entities: 'Product', 'Category', 'Order', 'User', 'Discount', 'Review', 'Setting'
    },
    entityId: { // The ID of the affected entity, if applicable
      type: mongoose.Schema.Types.Mixed, // Can be ObjectId or String depending on the entity
    },
    details: { // Additional information about the action, e.g., what was changed
      type: mongoose.Schema.Types.Mixed, // Flexible to store various details
    },
    ipAddress: { // Optional: IP address of the admin
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // We have a custom timestamp field
  }
);

// Indexes for querying logs
adminLogSchema.index({ user: 1, timestamp: -1 });
adminLogSchema.index({ action: 1, timestamp: -1 });
adminLogSchema.index({ entity: 1, entityId: 1, timestamp: -1 });

const AdminLog = mongoose.model('AdminLog', adminLogSchema);

module.exports = AdminLog;
