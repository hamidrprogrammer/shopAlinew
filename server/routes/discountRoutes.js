const express = require('express');
const discountController = require('../controllers/discountController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, createDiscountSchema, updateDiscountSchema, validateCartDiscountSchema } = require('../middleware/validationMiddleware');

const router = express.Router();

// --- User-facing route ---
// Validate a discount code for the cart
router.post('/validate', validate(validateCartDiscountSchema), discountController.validateDiscountForCart); // Can be protect if only logged-in users can use discounts


// --- Admin specific routes ---
// All routes below this point require admin privileges.
router.use(protect); // User must be logged in
router.use(authorize('admin')); // User must be an admin

// Create a new discount code
router.post('/', validate(createDiscountSchema), discountController.createDiscount);

// Get all discount codes
router.get('/', discountController.getAllDiscounts);

// Get a single discount code by ID or Code
router.get('/:idOrCode', discountController.getDiscount);

// Update a discount code by ID
router.put('/:id', validate(updateDiscountSchema), discountController.updateDiscount);

// Delete a discount code by ID
router.delete('/:id', discountController.deleteDiscount);

module.exports = router;
