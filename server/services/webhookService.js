// const Order = require('../models/Order');
const orderService = require('./orderService'); // Assuming orderService handles DB updates for orders
const paymentService = require('./paymentService'); // For any direct payment gateway interactions or complex logic
const adminLogService = require('./adminLogService'); // For logging significant webhook events
const AppError = require('../utils/appError');

/**
 * Processes a verified Stripe event.
 * This function is called after the webhook signature has been verified.
 * @param {object} stripeEvent - The verified event object from Stripe.
 */
exports.processStripeEvent = async (stripeEvent) => {
  console.log(`WebhookService: Processing Stripe event type ${stripeEvent.type}`, stripeEvent.id);
  let orderId;
  let paymentDetails = {
    gateway: 'stripe',
    transactionId: null,
    rawData: stripeEvent, // Store the raw event for auditing
  };

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        const session = stripeEvent.data.object;
        orderId = session.metadata ? session.metadata.orderId : null;
        paymentDetails.transactionId = session.payment_intent || session.id;
        paymentDetails.status = session.payment_status;

        if (!orderId) {
          console.warn('Stripe checkout.session.completed event missing orderId in metadata.', session.id);
          await adminLogService.createLog(null, 'WEBHOOK_STRIPE_EVENT_ERROR', 'StripeEvent', stripeEvent.id, { error: 'Missing orderId', eventType: stripeEvent.type });
          return; // Or throw an error to indicate processing failure
        }

        if (session.payment_status === 'paid') {
          console.log(`Payment successful for order ${orderId} via Stripe checkout session ${session.id}.`);
          await orderService.updateOrderOnPaymentSuccess(orderId, paymentDetails);
          await adminLogService.createLog(null, 'WEBHOOK_STRIPE_PAYMENT_SUCCESS', 'Order', orderId, { eventId: stripeEvent.id, sessionId: session.id });
        } else {
          console.log(`Payment status for order ${orderId} via Stripe session ${session.id} is ${session.payment_status}.`);
          await orderService.updateOrderOnPaymentFailure(orderId, paymentDetails);
          await adminLogService.createLog(null, 'WEBHOOK_STRIPE_PAYMENT_STATUS', 'Order', orderId, { eventId: stripeEvent.id, sessionId: session.id, paymentStatus: session.payment_status });
        }
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = stripeEvent.data.object;
        orderId = paymentIntent.metadata ? paymentIntent.metadata.orderId : null;
        paymentDetails.transactionId = paymentIntent.id;
        paymentDetails.status = 'succeeded';

        if (!orderId) {
            console.warn('Stripe payment_intent.succeeded event missing orderId in metadata.', paymentIntent.id);
            await adminLogService.createLog(null, 'WEBHOOK_STRIPE_EVENT_ERROR', 'StripeEvent', stripeEvent.id, { error: 'Missing orderId', eventType: stripeEvent.type });
            return;
        }
        console.log(`PaymentIntent ${paymentIntent.id} for order ${orderId} succeeded.`);
        await orderService.updateOrderOnPaymentSuccess(orderId, paymentDetails);
        await adminLogService.createLog(null, 'WEBHOOK_STRIPE_PAYMENT_SUCCESS', 'Order', orderId, { eventId: stripeEvent.id, paymentIntentId: paymentIntent.id });
        break;

      case 'payment_intent.payment_failed':
        const failedPaymentIntent = stripeEvent.data.object;
        orderId = failedPaymentIntent.metadata ? failedPaymentIntent.metadata.orderId : null;
        paymentDetails.transactionId = failedPaymentIntent.id;
        paymentDetails.status = 'failed';
        paymentDetails.failureReason = failedPaymentIntent.last_payment_error ? failedPaymentIntent.last_payment_error.message : 'Unknown reason';

        if (!orderId) {
            console.warn('Stripe payment_intent.payment_failed event missing orderId in metadata.', failedPaymentIntent.id);
            await adminLogService.createLog(null, 'WEBHOOK_STRIPE_EVENT_ERROR', 'StripeEvent', stripeEvent.id, { error: 'Missing orderId', eventType: stripeEvent.type });
            return;
        }
        console.log(`PaymentIntent ${failedPaymentIntent.id} for order ${orderId} failed. Reason: ${paymentDetails.failureReason}`);
        await orderService.updateOrderOnPaymentFailure(orderId, paymentDetails);
        await adminLogService.createLog(null, 'WEBHOOK_STRIPE_PAYMENT_FAILURE', 'Order', orderId, { eventId: stripeEvent.id, paymentIntentId: failedPaymentIntent.id, reason: paymentDetails.failureReason });
        break;

      // Add more cases as needed, e.g., for refunds, disputes
      // case 'charge.refunded':
      //   const refund = stripeEvent.data.object;
      //   // Handle refund logic
      //   break;

      default:
        console.log(`WebhookService: Unhandled Stripe event type ${stripeEvent.type}. Event ID: ${stripeEvent.id}`);
        await adminLogService.createLog(null, 'WEBHOOK_STRIPE_UNHANDLED_EVENT', 'StripeEvent', stripeEvent.id, { eventType: stripeEvent.type });
    }
  } catch (error) {
    console.error(`Error processing Stripe event ${stripeEvent.id} (type: ${stripeEvent.type}):`, error);
    await adminLogService.createLog(null, 'WEBHOOK_STRIPE_PROCESSING_ERROR', 'StripeEvent', stripeEvent.id, { error: error.message, eventType: stripeEvent.type, orderId });
    // Optionally re-throw if the controller should send a 500 response to Stripe,
    // which might cause Stripe to retry the webhook.
    // throw new AppError(`Webhook processing error for Stripe event ${stripeEvent.id}: ${error.message}`, 500);
  }
};


/**
 * Processes a verified Iyzico webhook payload.
 * This function is called after the webhook has been verified.
 * @param {object} iyzicoPayload - The payload from Iyzico.
 * @param {object} req - The Express request object, for potential access to headers or other info if needed for complex verification.
 */
exports.processIyzicoEvent = async (iyzicoPayload, req) => {
  console.log('WebhookService: Processing Iyzico payload:', iyzicoPayload);
  let orderId = iyzicoPayload.merchantOid; // Assuming merchantOid is your internal order ID
  let paymentDetails = {
    gateway: 'iyzico',
    transactionId: iyzicoPayload.paymentId || iyzicoPayload.paymentConversationId, // or other relevant ID
    status: iyzicoPayload.status, // e.g., 'SUCCESS', 'FAILURE'
    rawData: iyzicoPayload,
  };

  try {
    if (!orderId) {
      console.warn('Iyzico webhook payload missing merchantOid (orderId).', iyzicoPayload);
      await adminLogService.createLog(null, 'WEBHOOK_IYZICO_EVENT_ERROR', 'IyzicoPayload', paymentDetails.transactionId, { error: 'Missing merchantOid' });
      return;
    }

    if (iyzicoPayload.status === 'SUCCESS') {
      console.log(`Payment successful for order ${orderId} via Iyzico. Payment ID: ${paymentDetails.transactionId}.`);
      await orderService.updateOrderOnPaymentSuccess(orderId, paymentDetails);
      await adminLogService.createLog(null, 'WEBHOOK_IYZICO_PAYMENT_SUCCESS', 'Order', orderId, { paymentId: paymentDetails.transactionId });
    } else {
      // Handle other statuses like 'FAILURE', etc.
      paymentDetails.failureReason = iyzicoPayload.errorMessage || 'Iyzico payment not successful';
      console.log(`Iyzico payment status for order ${orderId} is ${iyzicoPayload.status}. Reason: ${paymentDetails.failureReason}`);
      await orderService.updateOrderOnPaymentFailure(orderId, paymentDetails);
      await adminLogService.createLog(null, 'WEBHOOK_IYZICO_PAYMENT_FAILURE', 'Order', orderId, { paymentId: paymentDetails.transactionId, status: iyzicoPayload.status, reason: paymentDetails.failureReason });
    }
  } catch (error) {
    console.error(`Error processing Iyzico payload for order ${orderId}:`, error);
    await adminLogService.createLog(null, 'WEBHOOK_IYZICO_PROCESSING_ERROR', 'IyzicoPayload', paymentDetails.transactionId, { error: error.message, orderId });
    // throw new AppError(`Webhook processing error for Iyzico payload (order ${orderId}): ${error.message}`, 500);
  }
};

// Add similar processing functions for other payment gateways as needed.
