const express = require('express');
const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  // verifyEmail,
  // sendVerificationEmail,
  // refreshToken,
  // manageTwoFactorAuth,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // authorize removed as it's not used in this file directly now
const {
  validate,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} = require('../middleware/validationMiddleware');

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forgotpassword', validate(forgotPasswordSchema), forgotPassword);
router.put('/resetpassword/:resettoken', validate(resetPasswordSchema), resetPassword);
// router.post('/refreshtoken', refreshToken); // If implementing refresh tokens

// Protected routes (user must be logged in)
router.use(protect); // All routes below this will be protected

router.get('/me', getMe);
router.get('/logout', logout); // Or POST, depending on preference
router.put('/updatepassword', validate(updatePasswordSchema), updatePassword);
// router.post('/sendverificationemail', sendVerificationEmail);
// router.get('/verifyemail/:verifytoken', verifyEmail);

// Routes for Two-Factor Authentication (2FA) - Example
// router.post('/2fa/setup', manageTwoFactorAuth.setup);
// router.post('/2fa/verify', manageTwoFactorAuth.verify);
// router.post('/2fa/disable', manageTwoFactorAuth.disable);
// router.get('/2fa/recovery-codes', manageTwoFactorAuth.getRecoveryCodes);


// Example of an admin-only route within auth context (though typically admin actions are in their own route files)
// router.get('/admin-check', authorize('admin'), (req, res) => {
//   res.status(200).json({ success: true, message: 'Admin access confirmed' });
// });


module.exports = router;
