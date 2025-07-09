const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // For password reset token

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name!'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'manager'], // Add more roles as needed
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Do not send password back in queries by default
    },
    passwordConfirm: { // Only used for validation, not saved to DB
      type: String,
      // required: [true, 'Please confirm your password'], // Only required on create/update password
      validate: {
        // This only works on CREATE and SAVE!!
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not the same!',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Fields for two-factor authentication (2FA)
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: String, // Encrypted secret for OTP generation
    twoFactorRecoveryCodes: [String], // Backup codes for 2FA

    // Optional: Store preferred language, theme for the user
    // preferences: {
    //   language: { type: String, default: 'en' },
    //   theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    // },

    // Optional: User activity tracking
    // lastLogin: Date,
    // loginAttempts: { type: Number, default: 0 },
    // accountLockedUntil: Date,

    // Optional: Address(es) - can be an array of subdocuments or a separate collection
    // addresses: [
    //   {
    //     street: String,
    //     city: String,
    //     postalCode: String,
    //     country: String,
    //     isDefault: Boolean,
    //   }
    // ],

    isActive: { // For soft delete or account deactivation
        type: Boolean,
        default: true,
        // select: false // Optionally hide this field by default
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
    toJSON: { virtuals: true }, // Ensure virtuals are included when document is converted to JSON
    toObject: { virtuals: true }, // Ensure virtuals are included when document is converted to object
  }
);

// --- Mongoose Middlewares (Hooks) ---

// Pre-save middleware to hash password
// Only run this function if password was actually modified (or is new)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field as it's not needed in the DB
  this.passwordConfirm = undefined;
  next();
});

// Pre-save middleware to update passwordChangedAt timestamp
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // Subtract 1 sec to ensure token is created after password change
  next();
});

// Pre-query middleware to filter out inactive users (for find queries)
// userSchema.pre(/^find/, function(next) {
//   // this points to the current query
//   this.find({ isActive: { $ne: false } }); // $ne: false includes true and undefined
//   next();
// });


// --- Instance Methods (available on document instances) ---

// Method to compare candidate password with the user's hashed password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword // The hashed password from the database
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to check if user changed password after a given JWT timestamp
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};

// Method to create a password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken); // For debugging

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes

  return resetToken; // Return the unhashed token to be sent via email
};

// TODO: Add methods for 2FA if implementing:
// - generateTwoFactorSecret
// - verifyTwoFactorToken
// - generateRecoveryCodes

const User = mongoose.model('User', userSchema);

module.exports = User;
