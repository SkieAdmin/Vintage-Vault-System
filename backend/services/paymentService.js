/**
 * SIMULATED payment provider.
 *
 * This school project does not talk to the real GCash / Maya / PayPal APIs.
 * Instead the app calls the functions below, which behave like a payment
 * gateway would: you create a payment, you get a reference number, and later
 * you confirm it.
 *
 * Swapping in a real provider later only means rewriting the two functions in
 * this file - no controller, route or screen needs to change.
 */
const { ONLINE_PAYMENT_METHODS } = require('../utils/constants');

const PAYMENT_LABELS = {
  gcash: 'GCash',
  maya: 'Maya',
  paypal: 'PayPal',
  cash_on_pickup: 'Cash on Pickup',
  cash_on_delivery: 'Cash on Delivery',
};

function isOnlinePayment(method) {
  return ONLINE_PAYMENT_METHODS.includes(method);
}

function paymentLabel(method) {
  return PAYMENT_LABELS[method] || method;
}

/** Reference number shown on the payment screen, e.g. "GCASH-8F3K2Q-1042". */
function createPaymentReference(method, orderId) {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${method.toUpperCase().replace(/_/g, '')}-${random}-${orderId}`;
}

/**
 * Pretends to charge the customer. A real integration would call the provider
 * here and return their response. We always succeed after a short "processing"
 * delay handled by the mobile app.
 */
function confirmSimulatedPayment({ method, orderId, amount }) {
  return {
    success: true,
    reference: createPaymentReference(method, orderId),
    paidAt: new Date().toISOString(),
    amount,
    provider: paymentLabel(method),
    simulated: true,
  };
}

module.exports = {
  isOnlinePayment,
  paymentLabel,
  createPaymentReference,
  confirmSimulatedPayment,
};
