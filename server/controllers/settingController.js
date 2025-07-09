const settingService = require('../services/settingService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// @desc    Get current store settings
// @route   GET /api/v1/settings
// @access  Public (or Admin, depending on sensitivity of data returned)
exports.getSettings = catchAsync(async (req, res, next) => {
  const settings = await settingService.getSettings();

  // Depending on who is requesting, you might want to filter out sensitive settings.
  // For now, returning all settings. Access control can be added here or in service.
  // if (req.user && req.user.role === 'admin') { ... } else { ... filter ... }

  res.status(200).json({
    status: 'success',
    data: {
      settings,
    },
  });
});

// @desc    Update store settings (Admin)
// @route   PUT /api/v1/settings
// @access  Private/Admin
exports.updateSettings = catchAsync(async (req, res, next) => {
  const settingsData = req.body;

  if (Object.keys(settingsData).length === 0) {
    return next(new AppError('No settings data provided for update.', 400));
  }

  // Zod validation in middleware will handle structure and type checks.
  const updatedSettings = await settingService.updateSettings(settingsData);

  logger.info(`Store settings updated by admin ${req.user.id}.`);
  res.status(200).json({
    status: 'success',
    message: 'Store settings updated successfully.',
    data: {
      settings: updatedSettings,
    },
  });
});
