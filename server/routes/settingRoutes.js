const express = require('express');
const settingController = require('../controllers/settingController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, updateSettingsSchema } = require('../middleware/validationMiddleware');

const router = express.Router();

// --- Public Route (or protected based on sensitivity) ---
// Get current store settings
// This route might be public if settings are generally needed by the client (e.g., store name, currency).
// If some settings are sensitive, they should be filtered out in the controller/service,
// or this route should also be protected. For now, let's assume it's public for general info.
router.get('/', settingController.getSettings);


// --- Protected Admin Route ---
// Update store settings
router.put('/', protect, authorize('admin'), validate(updateSettingsSchema), settingController.updateSettings);


module.exports = router;
