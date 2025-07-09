const mongoose = require('mongoose');

// This schema represents a single document that holds all store settings.
// We will typically only have one document in the 'settings' collection.
const settingSchema = new mongoose.Schema(
  {
    // Basic Store Information
    storeName: {
      type: String,
      trim: true,
      default: 'My Awesome Furniture Store',
    },
    storeEmail: { // For customer inquiries
      type: String,
      trim: true,
      lowercase: true,
      // validate: [validator.isEmail, 'Please provide a valid store email'], // Add validator if needed
    },
    storePhoneNumber: { // For customer inquiries
      type: String,
      trim: true,
    },
    storeAddress: { // Physical address if any, or main office
      street: String,
      city: String,
      postalCode: String,
      country: String,
      state: String, // Or province
    },
    logoUrl: String, // URL to the store logo
    faviconUrl: String,

    // Currency Settings
    currency: {
      code: { type: String, default: 'USD', uppercase: true, trim: true }, // e.g., USD, EUR, IRR
      symbol: { type: String, default: '$', trim: true },
      // placement: { type: String, enum: ['before', 'after'], default: 'before' }, // e.g., $100 or 100$
    },

    // Tax Settings
    taxSettings: {
      enabled: { type: Boolean, default: false }, // Is tax calculation enabled?
      defaultRatePercent: { type: Number, min: 0, max: 100, default: 0 }, // Default tax rate
      // pricesIncludeTax: { type: Boolean, default: false }, // Are product prices entered inclusive or exclusive of tax?
      // taxIdNumber: String, // Store's tax ID
    },

    // Shipping Settings
    shippingSettings: {
      // Example: Flat rate shipping
      defaultShippingCost: { type: Number, min: 0, default: 0 },
      freeShippingThreshold: { type: Number, min: 0, default: null }, // Null means no free shipping threshold
      // Could be more complex with zones, weight-based, etc.
      // localPickupAvailable: { type: Boolean, default: false },
    },

    // Social Media Links
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
      pinterest: String,
      // Add more as needed
    },

    // SEO Defaults
    defaultMetaTitle: String,
    defaultMetaDescription: String,

    // Optional: Maintenance Mode
    // maintenanceMode: {
    //   enabled: { type: Boolean, default: false },
    //   message: String,
    // },

    // To ensure only one settings document (optional, can be handled by service logic)
    // uniqueIdentifier: {
    //   type: String,
    //   default: 'global_settings',
    //   unique: true
    // }
  },
  {
    timestamps: true, // To know when settings were last updated
  }
);

// To ensure we only ever have one settings document, we can use a pre-save hook
// or handle it in the service layer (find one, if not exists, create; if exists, update).
// The service layer approach is often cleaner.

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;
