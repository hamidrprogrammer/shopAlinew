const Setting = require('../models/Setting');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// There should ideally be only one settings document in the collection.
// We can define a unique key if needed, or just rely on finding the first one.

// @desc    Get current store settings
// @access  Public/Admin (depending on what settings are sensitive)
exports.getSettings = async () => {
  // Find the first (and ideally only) settings document.
  // If no settings document exists, create a default one.
  let settings = await Setting.findOne();

  if (!settings) {
    logger.info('No settings document found, creating default settings.');
    settings = await Setting.create({}); // Create with default values from schema
    // If you have a uniqueIdentifier in schema:
    // settings = await Setting.findOneAndUpdate({ uniqueIdentifier: 'global_settings' }, {}, { new: true, upsert: true, runValidators: true });
  }
  return settings;
};

// @desc    Update store settings (Admin)
// @access  Admin
exports.updateSettings = async (settingsData) => {
  // Find the first (and ideally only) settings document, and update it.
  // Use findOneAndUpdate with upsert:true to create if it doesn't exist.

  // Exclude fields that should not be directly updatable if any (e.g. _id, timestamps)
  // For a full settings object update, this is usually fine.
  // Zod validation in middleware should ensure `settingsData` has the correct structure.

  // If you used a uniqueIdentifier:
  // const query = { uniqueIdentifier: 'global_settings' };
  // const updatedSettings = await Setting.findOneAndUpdate(query, settingsData, {
  //   new: true, // Return the modified document
  //   upsert: true, // Create if it doesn't exist
  //   runValidators: true, // Ensure schema validations are run
  // });

  // Simpler approach: find one, then update its fields, then save.
  // This allows Mongoose pre-save hooks to run if any were defined.
  let settings = await Setting.findOne();
  if (!settings) {
    settings = new Setting(settingsData);
  } else {
    // Update existing settings document
    // This approach allows partial updates more easily
    Object.keys(settingsData).forEach(key => {
        if (settingsData[key] !== undefined) { // Check for undefined to allow setting null
            // Handle nested objects carefully (e.g. taxSettings, currency)
            if (typeof settingsData[key] === 'object' && settingsData[key] !== null && !Array.isArray(settingsData[key])) {
                settings[key] = { ...(settings[key] ? settings[key].toObject() : {}), ...settingsData[key] };
            } else {
                settings[key] = settingsData[key];
            }
        }
    });
  }

  await settings.save({ validateBeforeSave: true }); // Run Mongoose validations

  logger.info('Store settings updated successfully.');
  return settings;
};
