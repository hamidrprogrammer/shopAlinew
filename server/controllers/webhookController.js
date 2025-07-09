const config = require('../config');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
// const orderService = require('../services/orderService'); // To update order status
// const paymentService = require('../services/paymentService'); // To interact with payment gateway SDKs
// const stripe = require('stripe')(config.stripe.secretKey); // Initialize Stripe if not done in paymentService

exports.handleStripeWebhook = catchAsync(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = config.stripe.webhookSecret;
  let event;

  if (!endpointSecret) {
    console.error('Stripe webhook secret is not configured.');
    return next(new AppError('Stripe webhook secret not configured. Cannot process webhook.', 500));
  }
  if (!sig) {
    console.warn('Stripe webhook request missing signature.');
    return next(new AppError('Missing Stripe signature.', 400));
  }

  try {
    // Ensure you have the stripe SDK initialized, e.g., const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY');
    // This should ideally be part of a paymentService.
    const stripe = require('stripe')(config.stripe.secretKey);
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed for Stripe:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Received verified Stripe event:', event.type);

  // --- TODO: Implement Service Logic via paymentService or webhookService ---
  // await webhookService.processStripeEvent(event);
  // Example direct handling (should be in a service):
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Metadata should contain your internal orderId
      const orderId = session.metadata ? session.metadata.orderId : null;
      if (orderId && session.payment_status === 'paid') {
        console.log(`Checkout session completed for order ${orderId}. Payment successful.`);
        // await orderService.updateOrderStatusToPaid(orderId, session.payment_intent, 'stripe', session);
      } else if (orderId) {
        console.log(`Checkout session completed for order ${orderId}. Payment status: ${session.payment_status}.`);
        // await orderService.updateOrderStatus(orderId, 'Payment Failed'); // Or a more specific status
      } else {
        console.warn('Checkout session completed without orderId in metadata or payment not successful.');
      }
      break;
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // This event is often used if you are creating PaymentIntents directly.
      // If using Stripe Checkout, 'checkout.session.completed' is usually sufficient.
      console.log(`PaymentIntent ${paymentIntent.id} succeeded.`);
      // const orderIdFromPaymentIntent = paymentIntent.metadata ? paymentIntent.metadata.orderId : null;
      // if (orderIdFromPaymentIntent) {
      //   await orderService.updateOrderStatusToPaid(orderIdFromPaymentIntent, paymentIntent.id, 'stripe', paymentIntent);
      // }
      break;
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      console.log(`PaymentIntent ${failedPaymentIntent.id} failed.`);
      // const orderIdFromFailedPI = failedPaymentIntent.metadata ? failedPaymentIntent.metadata.orderId : null;
      // if (orderIdFromFailedPI) {
      //    await orderService.updateOrderStatus(orderIdFromFailedPI, 'Payment Failed');
      // }
      break;
    // ... handle other event types as needed
    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
});


exports.handleIyzicoWebhook = catchAsync(async (req, res, next) => {
  const iyzicoPayload = req.body;
  console.log('Received Iyzico webhook payload:', iyzicoPayload);

  // --- TODO: Implement Iyzico Webhook Verification & Service Logic ---
  // const isValid = await paymentService.verifyIyzicoWebhook(req); // Pass entire request or relevant parts
  // if (!isValid) {
  //   console.warn('Invalid Iyzico webhook signature or request.');
  //   return next(new AppError('Invalid Iyzico webhook.', 400));
  // }
  // await webhookService.processIyzicoEvent(iyzicoPayload);

  // Example: Assuming payload contains status and orderId (or token to retrieve orderId)
  // const { status, paymentId, conversationId, merchantOid } = iyzicoPayload;
  // if (status === 'SUCCESS' && merchantOid) { // merchantOid is often your internal order ID
  //   console.log(`Iyzico payment successful for order ${merchantOid}. Payment ID: ${paymentId}`);
  //   await orderService.updateOrderStatusToPaid(merchantOid, paymentId, 'iyzico', iyzicoPayload);
  // } else if (merchantOid) {
  //   console.log(`Iyzico payment status for order ${merchantOid}: ${status}`);
  //   await orderService.updateOrderStatus(merchantOid, 'Payment Failed'); // Or a more specific status from Iyzico
  // } else {
  //   console.warn('Iyzico webhook missing order identifier or payment not successful.');
  // }

  res.status(200).json({
    received: true,
    message: 'Iyzico webhook received. Processing logic pending.'
  });
});

// Add handlers for other payment gateways if needed.
