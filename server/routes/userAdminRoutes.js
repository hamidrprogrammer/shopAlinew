const express = require('express');
const userAdminController = require('../controllers/userAdminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, adminUpdateUserSchema } = require('../middleware/validationMiddleware');

const router = express.Router();

// All routes in this file are protected and require admin privileges
router.use(protect);
router.use(authorize('admin')); // Ensures only users with 'admin' role can access

// GET all users
// Path: /api/v1/admin/users (assuming this router is mounted at /admin/users)
router.get('/', userAdminController.getAllUsers);

// GET a single user by ID
// Path: /api/v1/admin/users/:id
router.get('/:id', userAdminController.getUserById);

// PUT update user details (e.g., role, isActive, name, email)
// Path: /api/v1/admin/users/:id
router.put('/:id', validate(adminUpdateUserSchema), userAdminController.updateUserByAdmin);

// DELETE a user (soft delete recommended)
// Path: /api/v1/admin/users/:id
router.delete('/:id', userAdminController.deleteUserByAdmin);

module.exports = router;
