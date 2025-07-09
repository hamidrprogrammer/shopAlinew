const { z } = require('zod');
const AppError = require('../utils/appError');

// Middleware to validate request body against a Zod schema
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format Zod errors for a more user-friendly response
      const formattedErrors = error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      // return next(new AppError(`Invalid input: ${error.errors.map(e => e.message).join(', ')}`, 400));
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid input data.',
        errors: formattedErrors,
      });
    }
    // For other types of errors, pass to global error handler
    next(new AppError('An unexpected error occurred during validation.', 500));
  }
};

// --- Define Schemas for Authentication ---

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name cannot exceed 50 characters').trim(),
  email: z.string().min(1, 'Email is required').email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  passwordConfirm: z.string().min(1, 'Password confirmation is required'), // Optional: Add role validation if clients can send it
  // role: z.enum(['user', 'admin', 'manager']).optional(), // Example if role can be sent
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords don't match",
  path: ['passwordConfirm'], // Path of the error
});

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address').toLowerCase().trim(),
});

const resetPasswordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    passwordConfirm: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ['passwordConfirm'],
});

const updatePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    password: z.string().min(6, 'New password must be at least 6 characters long'),
    passwordConfirm: z.string().min(1, 'New password confirmation is required'),
}).refine((data) => data.password === data.passwordConfirm, {
    message: "New passwords don't match",
    path: ['passwordConfirm'],
});


module.exports = {
  validate,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
};

// --- Define Schemas for Categories ---

const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters long').max(50, 'Category name cannot exceed 50 characters').trim(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').trim().optional(),
  image: z.string().url('Invalid URL for image').optional().or(z.literal('')), // Allow empty string or valid URL
  parent: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent category ID').optional().nullable(), // Optional: ObjectId string or null
});

// For updates, all fields are optional, but if provided, they should meet the criteria.
const updateCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters long').max(50, 'Category name cannot exceed 50 characters').trim().optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').trim().optional().nullable(),
  image: z.string().url('Invalid URL for image').optional().nullable().or(z.literal('')),
  parent: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent category ID').optional().nullable(),
});


module.exports = {
  validate,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  createCategorySchema,
  updateCategorySchema,
};

// --- Define Schemas for Products ---

const imageSchema = z.object({
  url: z.string().url('Image URL must be a valid URL').min(1, 'Image URL is required'),
  altText: z.string().trim().max(250, 'Alt text cannot exceed 250 characters').optional().default(''),
  isPrimary: z.boolean().optional().default(false),
});

const attributeSchema = z.object({
    name: z.string().min(1, 'Attribute name is required').trim().max(100, 'Attribute name cannot exceed 100 chars'),
    value: z.string().min(1, 'Attribute value is required').trim().max(250, 'Attribute value cannot exceed 250 chars'),
});

const createProductSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters').max(150).trim(),
  sku: z.string().max(50).trim().optional(), // Optional: can be auto-generated or required based on logic
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000).trim(),
  shortDescription: z.string().max(250).trim().optional(),
  price: z.number().min(0, 'Price cannot be negative'),
  salePrice: z.number().min(0, 'Sale price cannot be negative').optional().nullable()
    .refine(val => val === null || val === undefined || typeof val === 'number', { message: "Sale price must be a number or null" }),
  categories: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID format')).min(0, 'Product must belong to at least one category').optional().default([]), // Or .min(1) if required
  brand: z.string().max(50).trim().optional(),
  stockQuantity: z.number().int('Stock quantity must be an integer').min(0, 'Stock quantity cannot be negative').default(0),
  attributes: z.array(attributeSchema).optional().default([]),
  images: z.array(imageSchema).min(0, 'At least one image is recommended').optional().default([]), // or .min(1)
  tags: z.array(z.string().trim().max(50, 'Tag cannot exceed 50 characters')).optional().default([]),
  isPublished: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
}).refine(data => data.salePrice === null || data.salePrice === undefined || data.salePrice < data.price, {
  message: 'Sale price must be less than the regular price',
  path: ['salePrice'],
});


// For updates, all fields are optional.
// Consider using .partial() on createProductSchema if appropriate, or define explicitly.
const updateProductSchema = z.object({
  name: z.string().min(3).max(150).trim().optional(),
  // SKU might be non-editable or have special logic, typically not updated freely.
  // sku: z.string().max(50).trim().optional(),
  description: z.string().min(10).max(2000).trim().optional(),
  shortDescription: z.string().max(250).trim().optional().nullable(),
  price: z.number().min(0).optional(),
  salePrice: z.number().min(0).optional().nullable()
    .refine(val => val === null || val === undefined || typeof val === 'number', { message: "Sale price must be a number or null" }),
  categories: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(0).optional(),
  brand: z.string().max(50).trim().optional().nullable(),
  stockQuantity: z.number().int().min(0).optional(),
  attributes: z.array(attributeSchema).optional(),
  images: z.array(imageSchema).min(0).optional(),
  tags: z.array(z.string().trim().max(50)).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
}).refine(data => {
    // If both price and salePrice are provided for update, salePrice should be less than price.
    // If only one is provided, this check is not needed or needs context of existing data.
    // This simple check assumes if both are in payload, the rule applies.
    // More complex validation might need service-layer checks with existing product data.
    if (typeof data.salePrice === 'number' && typeof data.price === 'number') {
        return data.salePrice < data.price;
    }
    if (typeof data.salePrice === 'number' && data.price === undefined) {
        // Need to fetch product to compare, or this validation is partial.
        // For Zod, it's best to validate based on provided data only.
        return true; // Or throw if this scenario is invalid without context
    }
    return true;
}, {
  message: 'Sale price must be less than the regular price if both are updated',
  path: ['salePrice'],
});


module.exports = {
  validate,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  createCategorySchema,
  updateCategorySchema,
  createProductSchema,
  updateProductSchema,
};

// --- Define Schemas for Orders ---

const orderItemSchemaValidation = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  // Price, name, sku, image will be populated from product on the backend for security/consistency
});

const shippingAddressSchemaValidation = z.object({
  fullName: z.string().min(1, 'Full name is required').trim(),
  address: z.string().min(1, 'Street address is required').trim(),
  city: z.string().min(1, 'City is required').trim(),
  postalCode: z.string().min(1, 'Postal code is required').trim(),
  country: z.string().min(1, 'Country is required').trim(),
  phoneNumber: z.string().min(1, 'Phone number is required').trim(),
});

const createOrderSchema = z.object({
  orderItems: z.array(orderItemSchemaValidation).min(1, 'Order must contain at least one item'),
  shippingAddress: shippingAddressSchemaValidation,
  paymentMethod: z.enum(['stripe', 'paypal', 'iyzico', 'cash_on_delivery', 'bank_transfer'], {
    required_error: "Payment method is required",
    invalid_type_error: "Invalid payment method",
  }),
  // Prices (itemsPrice, taxPrice, shippingPrice, totalPrice) are best calculated on the backend.
  // Client can send them for reference, but backend should verify or recalculate.
  // For Zod, we can make them optional or validate if provided.
  itemsPrice: z.number().min(0).optional(), // Will be recalculated
  taxPrice: z.number().min(0).optional().default(0),
  shippingPrice: z.number().min(0).optional().default(0),
  // totalPrice: z.number().min(0).optional(), // Will be recalculated
  // notes: z.string().trim().optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum([
    'Pending', 'Payment Failed', 'Processing', 'Shipped',
    'Out For Delivery', 'Delivered', 'Cancelled', 'Refunded', 'On Hold'
  ], {
    required_error: "Order status is required",
    invalid_type_error: "Invalid order status",
  }),
  trackingNumber: z.string().trim().optional(),
  shippingCarrier: z.string().trim().optional(),
});

const updateOrderToPaidSchema = z.object({
    paymentResult: z.object({
        id: z.string().min(1, "Payment transaction ID is required"),
        status: z.string().min(1, "Payment status is required"),
        update_time: z.string().datetime({ message: "Invalid datetime string for payment update_time" }).optional(),
        email_address: z.string().email("Invalid email address for payer").optional(),
    }).optional(), // paymentResult itself can be optional if admin is just marking paid without full details
});


module.exports = {
  validate,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  createCategorySchema,
  updateCategorySchema,
  createProductSchema,
  updateProductSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  updateOrderToPaidSchema,
};

// --- Define Schema for Admin User Update ---
const adminUpdateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name cannot exceed 50 characters').trim().optional(),
  email: z.string().email('Invalid email address').toLowerCase().trim().optional(),
  role: z.enum(['user', 'admin', 'manager'], {
    invalid_type_error: "Invalid role. Allowed roles are 'user', 'admin', 'manager'.",
  }).optional(),
  isActive: z.boolean({
    invalid_type_error: "isActive must be a boolean value (true or false).",
  }).optional(),
  // Admin should not update password directly via this schema.
});


module.exports = {
  validate,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  createCategorySchema,
  updateCategorySchema,
  createProductSchema,
  updateProductSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  updateOrderToPaidSchema,
  adminUpdateUserSchema,
};

// --- Define Schemas for Reviews ---

const createReviewSchema = z.object({
  review: z.string().min(10, 'Review must be at least 10 characters long.').max(1000, 'Review cannot exceed 1000 characters.').trim(),
  rating: z.number().int().min(1, 'Rating must be between 1 and 5.').max(5, 'Rating must be between 1 and 5.'),
  title: z.string().max(100, 'Title cannot exceed 100 characters.').trim().optional(),
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID format').optional(), // Optional if productId is from URL params
});

// For updates, all fields are optional.
const updateReviewSchema = z.object({
  review: z.string().min(10).max(1000).trim().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(100).trim().optional(),
  // isApproved: z.boolean().optional(), // If admin can approve/disapprove
});


module.exports = {
  validate,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  createCategorySchema,
  updateCategorySchema,
  createProductSchema,
  updateProductSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  updateOrderToPaidSchema,
  adminUpdateUserSchema,
  createReviewSchema,
  updateReviewSchema,
};

// --- Define Schemas for Discounts ---

const createDiscountSchema = z.object({
  code: z.string().min(3).max(30).trim().toUpperCase(),
  description: z.string().max(255).trim().optional(),
  discountType: z.enum(['percentage', 'fixed_amount']),
  discountValue: z.number().positive('Discount value must be positive.'),
  isActive: z.boolean().optional().default(true),
  startDate: z.string().datetime({ message: "Invalid datetime string for start date. Use ISO 8601 format." }).optional(),
  endDate: z.string().datetime({ message: "Invalid datetime string for end date. Use ISO 8601 format." }).optional().nullable(),
  minimumPurchaseAmount: z.number().min(0).optional().default(0),
  usageLimit: z.number().int().min(1).optional().nullable(),
  // timesUsed: z.number().int().min(0).optional().default(0), // Usually not set on create
  applicableTo: z.enum(['all_products', 'specific_products', 'specific_categories']).optional().default('all_products'),
  applicableProductIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ID format")).optional(),
  applicableCategoryIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Category ID format")).optional(),
}).refine(data => {
    if (data.discountType === 'percentage' && (data.discountValue <= 0 || data.discountValue > 100)) {
        return false;
    }
    return true;
}, {
    message: 'Percentage discount value must be between 1 and 100.',
    path: ['discountValue'],
}).refine(data => !data.endDate || !data.startDate || new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after start date.',
    path: ['endDate'],
});

// For updates, most fields are optional.
const updateDiscountSchema = z.object({
  description: z.string().max(255).trim().optional().nullable(),
  discountType: z.enum(['percentage', 'fixed_amount']).optional(),
  discountValue: z.number().positive('Discount value must be positive.').optional(),
  isActive: z.boolean().optional(),
  startDate: z.string().datetime({ message: "Invalid datetime string for start date." }).optional(),
  endDate: z.string().datetime({ message: "Invalid datetime string for end date." }).optional().nullable(),
  minimumPurchaseAmount: z.number().min(0).optional(),
  usageLimit: z.number().int().min(1).optional().nullable(),
  applicableTo: z.enum(['all_products', 'specific_products', 'specific_categories']).optional(),
  applicableProductIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional().nullable(),
  applicableCategoryIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional().nullable(),
}).partial().refine(data => { // .partial() makes all fields optional
    if (data.discountType === 'percentage' && data.discountValue && (data.discountValue <= 0 || data.discountValue > 100)) {
        return false;
    }
    // If only one of discountType or discountValue is provided, this validation might need context from existing doc.
    // For now, assume if discountValue is provided with percentage type, it must be valid.
    return true;
}, {
    message: 'Percentage discount value must be between 1 and 100 if type is percentage.',
    path: ['discountValue'],
}).refine(data => {
    // This check is tricky if only one date is provided for update. Needs context of the other existing date.
    // Zod primarily validates the incoming payload. Service layer might need to handle cross-field date logic with DB data.
    if (data.endDate && data.startDate) return new Date(data.endDate) > new Date(data.startDate);
    return true; // If one or both are not provided, pass (service will handle with existing data)
}, {
    message: 'End date must be after start date if both are provided for update.',
    path: ['endDate'],
});


const validateCartDiscountSchema = z.object({
    code: z.string().min(1, 'Discount code is required.').trim().toUpperCase(),
    cartSubtotal: z.number().min(0, 'Cart subtotal cannot be negative.'),
    cartItems: z.array(z.object({
        product: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ID in cart item."),
        quantity: z.number().int().min(1, "Cart item quantity must be at least 1."),
        price: z.number().min(0, "Cart item price cannot be negative."),
    })).min(1, "Cart items array cannot be empty."),
});


module.exports = {
  validate,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  createCategorySchema,
  updateCategorySchema,
  createProductSchema,
  updateProductSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  updateOrderToPaidSchema,
  adminUpdateUserSchema,
  createReviewSchema,
  updateReviewSchema,
  createDiscountSchema,
  updateDiscountSchema,
  validateCartDiscountSchema,
};

// --- Define Schema for Settings Update ---

const currencySchemaValidation = z.object({
    code: z.string().uppercase().trim().min(3, "Currency code must be 3 chars").max(3, "Currency code must be 3 chars").optional(),
    symbol: z.string().trim().max(5, "Currency symbol too long").optional(),
}).partial(); // All fields optional within currency

const taxSettingsSchemaValidation = z.object({
    enabled: z.boolean().optional(),
    defaultRatePercent: z.number().min(0).max(100).optional(),
}).partial();

const shippingSettingsSchemaValidation = z.object({
    defaultShippingCost: z.number().min(0).optional(),
    freeShippingThreshold: z.number().min(0).optional().nullable(),
}).partial();

const storeAddressSchemaValidation = z.object({
    street: z.string().trim().optional().nullable(),
    city: z.string().trim().optional().nullable(),
    postalCode: z.string().trim().optional().nullable(),
    country: z.string().trim().optional().nullable(),
    state: z.string().trim().optional().nullable(),
}).partial();

const socialLinksSchemaValidation = z.object({
    facebook: z.string().url("Invalid Facebook URL").or(z.literal('')).optional().nullable(),
    instagram: z.string().url("Invalid Instagram URL").or(z.literal('')).optional().nullable(),
    twitter: z.string().url("Invalid Twitter URL").or(z.literal('')).optional().nullable(),
    pinterest: z.string().url("Invalid Pinterest URL").or(z.literal('')).optional().nullable(),
}).partial();


const updateSettingsSchema = z.object({
  storeName: z.string().trim().min(1, "Store name cannot be empty.").optional(),
  storeEmail: z.string().email("Invalid store email address.").trim().toLowerCase().optional(),
  storePhoneNumber: z.string().trim().optional().nullable(),
  storeAddress: storeAddressSchemaValidation.optional(),
  logoUrl: z.string().url("Invalid logo URL.").or(z.literal('')).optional().nullable(),
  faviconUrl: z.string().url("Invalid favicon URL").or(z.literal('')).optional().nullable(),
  currency: currencySchemaValidation.optional(),
  taxSettings: taxSettingsSchemaValidation.optional(),
  shippingSettings: shippingSettingsSchemaValidation.optional(),
  socialLinks: socialLinksSchemaValidation.optional(),
  defaultMetaTitle: z.string().trim().optional().nullable(),
  defaultMetaDescription: z.string().trim().optional().nullable(),
  // maintenanceMode: z.object({ enabled: z.boolean(), message: z.string().optional() }).optional(),
}).partial(); // .partial() makes all top-level fields optional for update operations


module.exports = {
  validate,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  createCategorySchema,
  updateCategorySchema,
  createProductSchema,
  updateProductSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  updateOrderToPaidSchema,
  adminUpdateUserSchema,
  createReviewSchema,
  updateReviewSchema,
  createDiscountSchema,
  updateDiscountSchema,
  validateCartDiscountSchema,
  updateSettingsSchema,
};
