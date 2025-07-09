// const Stripe = require('stripe');
// const config = require('../config');
// const Order = require('../models/Order'); // If needed to fetch order details for payment session
// const AppError = require('../utils/appError');

// let stripe;
// if (config.stripe.secretKey) {
//   stripe = Stripe(config.stripe.secretKey);
// } else {
//   console.warn('Stripe secret key is not configured. Stripe functionality will be disabled.');
// }

// // Iyzico SDK would be initialized here if used server-side for payment initiation
// // const Iyzico = require('iyzipay');
// // let iyzico;
// // if (config.iyzico.apiKey && config.iyzico.secretKey) {
// //   iyzico = new Iyzico({
// //     apiKey: config.iyzico.apiKey,
// //     secretKey: config.iyzico.secretKey,
// //     uri: config.iyzico.baseUrl || 'https://sandbox-api.iyzipay.com' // Or production URL
// //   });
// // } else {
// //   console.warn('Iyzico API key or secret key is not configured. Iyzico functionality will be disabled.');
// // }


/**
 * Creates a Stripe Checkout session for an order.
 * @param {object} order - The order object from the database.
 * @param {string} successUrl - The URL to redirect to on successful payment.
 * @param {string} cancelUrl - The URL to redirect to if payment is cancelled.
 * @returns {object} The Stripe session object.
 */
exports.createStripeCheckoutSession = async (order, successUrl, cancelUrl) => {
  // if (!stripe) {
  //   throw new AppError('Stripe is not configured. Cannot create checkout session.', 500);
  // }
  // if (!order || !order.orderItems || order.orderItems.length === 0) {
  //   throw new AppError('Order details are missing or order is empty.', 400);
  // }

  // const lineItems = order.orderItems.map(item => ({
  //   price_data: {
  //     currency: order.currencyCode || config.currency.code || 'usd', // Ensure currency is set
  //     product_data: {
  //       name: item.name,
  //       images: item.image ? [item.image] : [], // Stripe expects an array of image URLs
  //       description: item.shortDescription || `SKU: ${item.sku}`, // Optional
  //     },
  //     unit_amount: Math.round(item.price * 100), // Price in smallest currency unit (e.g., cents)
  //   },
  //   quantity: item.quantity,
  // }));

  // // Add shipping if applicable (Stripe handles this as a line item or shipping_options)
  // if (order.shippingPrice > 0) {
  //   lineItems.push({
  //     price_data: {
  //       currency: order.currencyCode || config.currency.code || 'usd',
  //       product_data: {
  //         name: 'Shipping',
  //       },
  //       unit_amount: Math.round(order.shippingPrice * 100),
  //     },
  //     quantity: 1,
  //   });
  // }

  // // Add tax if applicable and not included in item prices already
  // // This is a simplified tax addition. Stripe has more robust tax features (Stripe Tax).
  // if (order.taxPrice > 0 && !config.taxSettings.pricesIncludeTax) { // Example condition
  //    lineItems.push({
  //     price_data: {
  //       currency: order.currencyCode || config.currency.code || 'usd',
  //       product_data: {
  //         name: 'Tax',
  //       },
  //       unit_amount: Math.round(order.taxPrice * 100),
  //     },
  //     quantity: 1,
  //   });
  // }


  // const session = await stripe.checkout.sessions.create({
  //   payment_method_types: ['card'], // Add other payment methods as needed
  //   line_items: lineItems,
  //   mode: 'payment',
  //   success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`, // Can append session_id for confirmation
  //   cancel_url: cancelUrl,
  //   customer_email: order.user ? order.user.email : undefined, // Pre-fill email if user is known
  //   client_reference_id: order.id || order._id.toString(), // Your internal order ID
  //   metadata: { // Store your internal order ID for webhook reconciliation
  //     orderId: order.id || order._id.toString(),
  //     // Add any other relevant metadata
  //   },
  //   // Shipping address collection can be configured if needed
  //   // shipping_address_collection: {
  //   //   allowed_countries: ['US', 'CA', 'GB', 'DE', 'FR', 'TR'], // Example
  //   // },
  // });

  // return session;
  console.log('PaymentService: createStripeCheckoutSession (placeholder)', { orderId: order._id, successUrl, cancelUrl });
  return { id: 'cs_test_placeholder123', url: `${successUrl}?session_id=cs_test_placeholder123&order_id=${order._id}` };
};


/**
 * Creates a payment request for Iyzico.
 * @param {object} order - The order object from the database.
 * @param {object} buyerInfo - Information about the buyer.
 * @param {string} callbackUrl - The URL Iyzico will redirect to.
 * @returns {object} The Iyzico payment initialization response.
 */
exports.createIyzicoPaymentRequest = async (order, buyerInfo, callbackUrl) => {
  // if (!iyzico) {
  //   throw new AppError('Iyzico is not configured. Cannot create payment request.', 500);
  // }
  // if (!order || !order.orderItems || order.orderItems.length === 0) {
  //   throw new AppError('Order details are missing or order is empty.', 400);
  // }

  // const basketItems = order.orderItems.map(item => ({
  //   id: item.product.toString(), // Product ID or SKU
  //   name: item.name,
  //   category1: item.category ? item.category.name : 'General', // Main category
  //   // category2: 'Sub Category', // Optional
  //   itemType: 'PHYSICAL', // Or 'VIRTUAL'
  //   price: item.price.toString(), // Price as string
  // }));

  // // Note: Iyzico calculates total price based on basketItems.
  // // Shipping and tax might need to be added as separate line items if Iyzico supports it,
  // // or handled in your pricing before sending to Iyzico.
  // // For simplicity, let's assume totalPrice on order object is the final amount.

  // const request = {
  //   locale: buyerInfo.locale || 'tr', // e.g., 'tr', 'en'
  //   conversationId: order.id || order._id.toString(), // Your unique order/transaction ID
  //   price: order.totalPrice.toString(), // Total amount to be paid
  //   paidPrice: order.totalPrice.toString(), // Amount actually paid (usually same as price)
  //   currency: order.currencyCode || config.currency.code || 'TRY', // e.g., 'TRY', 'USD', 'EUR'
  //   basketId: order.id || order._id.toString(), // Optional, can be same as conversationId
  //   paymentGroup: 'PRODUCT', // Or 'LISTING', 'SUBSCRIPTION'
  //   callbackUrl: callbackUrl,
  //   enabledInstallments: [1, 2, 3, 6, 9], // Example: allowed installment counts

  //   buyer: {
  //     id: buyerInfo.id || 'BYR-GUEST-' + Date.now(), // Your unique buyer ID
  //     name: buyerInfo.firstName,
  //     surname: buyerInfo.lastName,
  //     gsmNumber: buyerInfo.phone, // E.164 format e.g., +905350000000
  //     email: buyerInfo.email,
  //     identityNumber: buyerInfo.identityNumber || '11111111110', // Turkish national ID or a placeholder
  //     // lastLoginDate: "2023-01-01 10:00:00", // Optional
  //     // registrationDate: "2022-01-01 10:00:00", // Optional
  //     registrationAddress: buyerInfo.address.fullAddress, // Full address string
  //     ip: buyerInfo.ip, // Buyer's IP address
  //     city: buyerInfo.address.city,
  //     country: buyerInfo.address.country,
  //     zipCode: buyerInfo.address.postalCode,
  //   },
  //   shippingAddress: {
  //     contactName: `${buyerInfo.firstName} ${buyerInfo.lastName}`,
  //     city: order.shippingAddress.city,
  //     country: order.shippingAddress.country,
  //     address: order.shippingAddress.address,
  //     zipCode: order.shippingAddress.postalCode,
  //   },
  //   billingAddress: { // Often same as shipping or buyer's registration address
  //     contactName: `${buyerInfo.firstName} ${buyerInfo.lastName}`,
  //     city: buyerInfo.address.city, // Or order.billingAddress.city
  //     country: buyerInfo.address.country,
  //     address: buyerInfo.address.fullAddress,
  //     zipCode: buyerInfo.address.postalCode,
  //   },
  //   basketItems: basketItems,
  // };

  // return new Promise((resolve, reject) => {
  //   iyzico.checkoutFormInitialize.create(request, (err, result) => {
  //     if (err) {
  //       console.error('Iyzico payment initialization error:', err);
  //       return reject(new AppError(`Iyzico payment error: ${err.errorMessage || 'Unknown error'}`, 500));
  //     }
  //     if (result.status === 'failure') {
  //       console.error('Iyzico payment initialization failure:', result);
  //       return reject(new AppError(`Iyzico payment failure: ${result.errorMessage}`, 400));
  //     }
  //     resolve(result); // Contains checkoutFormContent or paymentPageUrl
  //   });
  // });
  console.log('PaymentService: createIyzicoPaymentRequest (placeholder)', { orderId: order._id, buyerEmail: buyerInfo.email, callbackUrl });
  return { status: 'success', paymentPageUrl: `${callbackUrl}?token=iyzico_test_token&order_id=${order._id}`, checkoutFormContent: '<p>Iyzico form placeholder</p>' };
};


/**
 * Verifies an Iyzico webhook signature/payload.
 * This is a placeholder. Actual Iyzico webhook verification depends on their specific mechanism.
 * Some gateways use HMAC signatures, others rely on IP whitelisting or shared secrets in the payload.
 * @param {object} req - The Express request object.
 * @returns {boolean} True if the webhook is verified, false otherwise.
 */
// exports.verifyIyzicoWebhook = async (req) => {
//   // const iyzicoSignature = req.headers['x-iyzico-signature']; // Example header
//   // const payload = req.body; // Raw body might be needed
//   // const sharedSecret = config.iyzico.webhookSecret;
//   // if (!iyzicoSignature || !sharedSecret) return false;
//   // Calculate expected signature based on payload and secret
//   // const expectedSignature = crypto.createHmac('sha1', sharedSecret).update(JSON.stringify(payload)).digest('base64');
//   // return crypto.timingSafeEqual(Buffer.from(iyzicoSignature), Buffer.from(expectedSignature));
//   console.log('PaymentService: Verifying Iyzico webhook (placeholder). Needs actual Iyzico documentation.');
//   return true; // Placeholder - ALWAYS IMPLEMENT PROPER VERIFICATION
// };

// Add other payment related methods, e.g., processing refunds, querying transaction status.
// exports.refundStripePayment = async (paymentIntentId, amount) => { ... }
// exports.getIyzicoPaymentDetails = async (paymentId) => { ... }

console.log('PaymentService loaded (placeholder implementations).');
