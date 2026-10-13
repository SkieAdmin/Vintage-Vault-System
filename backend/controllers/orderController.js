/** Checkout, order history and payment confirmation. */
const orderModel = require('../models/orderModel');
const concernModel = require('../models/concernModel');
const orderService = require('../services/orderService');
const ApiError = require('../utils/ApiError');
const {
  requireString,
  optionalString,
  requireId,
  requireOneOf,
} = require('../utils/validators');
const {
  FULFILLMENT_METHODS,
  PAYMENT_METHODS,
  ORDER_STATUSES,
} = require('../utils/constants');

/** Reads and validates the checkout payload. Prices are NOT taken from the app. */
function readCheckoutBody(body, user) {
  const productIds = Array.isArray(body.productIds)
    ? body.productIds.map((id) => requireId(id, 'product id'))
    : [];
  if (!productIds.length) throw ApiError.badRequest('Your cart is empty.');

  const fulfillmentMethod = requireOneOf(
    body.fulfillmentMethod,
    FULFILLMENT_METHODS,
    'Fulfillment method'
  );
  const paymentMethod = requireOneOf(body.paymentMethod, PAYMENT_METHODS, 'Payment method');

  // Cash on delivery only makes sense for delivery, and vice versa.
  if (fulfillmentMethod === 'pickup' && paymentMethod === 'cash_on_delivery') {
    throw ApiError.badRequest('Choose "Cash on Pickup" for pickup orders.');
  }
  if (fulfillmentMethod === 'delivery' && paymentMethod === 'cash_on_pickup') {
    throw ApiError.badRequest('Choose "Cash on Delivery" for delivery orders.');
  }

  const recipientName = requireString(
    body.recipientName || user.name,
    'Recipient name',
    { min: 2, max: 80 }
  );
  const contactPhone = requireString(body.contactPhone || user.phone, 'Contact number', {
    min: 7,
    max: 20,
  });

  let deliveryAddress = '';
  let deliveryNotes = '';
  if (fulfillmentMethod === 'delivery') {
    deliveryAddress = requireString(body.deliveryAddress, 'Delivery address', {
      min: 10,
      max: 300,
    });
    deliveryNotes = optionalString(body.deliveryNotes, { max: 300 });
  }

  return {
    productIds,
    fulfillmentMethod,
    paymentMethod,
    recipientName,
    contactPhone,
    deliveryAddress,
    deliveryNotes,
  };
}

const orderController = {
  /** POST /api/orders */
  create(req, res) {
    const payload = readCheckoutBody(req.body, req.user);
    const order = orderService.placeOrder(req.user, payload);
    res.status(201).json({ success: true, order });
  },

  /** POST /api/orders/:id/pay - confirms the simulated GCash / Maya / PayPal payment. */
  pay(req, res) {
    const id = requireId(req.params.id, 'order id');
    const { order, payment } = orderService.payOrder(req.user, id);
    res.json({ success: true, order, payment });
  },

  /** GET /api/orders/my */
  mine(req, res) {
    res.json({ success: true, orders: orderModel.findByUser(req.user.id) });
  },

  /** GET /api/orders/:id - a customer may only open their own order. */
  getById(req, res) {
    const id = requireId(req.params.id, 'order id');
    const isAdmin = req.user.role === 'admin';
    const order = isAdmin ? orderModel.findByIdWithCustomer(id) : orderModel.findById(id);

    if (!order) throw ApiError.notFound('Order not found.');
    if (!isAdmin && order.userId !== req.user.id) {
      throw ApiError.forbidden('This order belongs to another customer.');
    }

    res.json({ success: true, order, concerns: concernModel.findByOrder(id) });
  },

  /** PUT /api/orders/:id/status - admin only (guarded by the route). */
  updateStatus(req, res) {
    const id = requireId(req.params.id, 'order id');
    const status = requireOneOf(req.body.orderStatus, ORDER_STATUSES, 'Order status');
    const order = orderService.updateOrderStatus(id, status);
    res.json({ success: true, order });
  },
};

module.exports = orderController;
