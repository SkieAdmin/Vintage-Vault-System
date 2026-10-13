/**
 * Order rules.
 *
 * Important: the client only sends product IDs. Prices, the delivery fee and
 * the total are all recalculated here from the database, so a modified app can
 * never buy a ₱1,250 jacket for ₱1.
 */
const { db } = require('../config/database');
const config = require('../config/env');
const productModel = require('../models/productModel');
const reservationModel = require('../models/reservationModel');
const orderModel = require('../models/orderModel');
const ApiError = require('../utils/ApiError');
const paymentService = require('./paymentService');
const { expireDueReservations } = require('./reservationService');

/**
 * Creates an order and marks every item as Sold, in a single transaction.
 * If any item fails the availability check, nothing is written at all.
 */
const placeOrder = db.transaction((user, payload) => {
  // Clear stale holds first so an expired reservation cannot be checked out.
  expireDueReservations();

  const productIds = [...new Set(payload.productIds)];
  if (!productIds.length) throw ApiError.badRequest('Your cart is empty.');

  const products = productModel.findManyByIds(productIds);
  if (products.length !== productIds.length) {
    throw ApiError.badRequest('One of the items in your cart no longer exists.');
  }

  const soldItems = [];

  products.forEach((product) => {
    if (product.status === 'Sold') {
      throw ApiError.conflict(`"${product.name}" has already been sold.`);
    }

    if (product.status === 'Reserved') {
      const reservation = reservationModel.findActiveByProduct(product.id);
      // Only the customer holding the reservation may buy it.
      if (!reservation || reservation.userId !== user.id) {
        throw ApiError.conflict(`"${product.name}" is reserved by another customer.`);
      }
      const locked = productModel.compareAndSetStatus(product.id, 'Reserved', 'Sold');
      if (!locked) throw ApiError.conflict(`"${product.name}" is no longer available.`);
      reservationModel.setStatus(reservation.id, 'completed');
    } else {
      // Buying straight from Available (the customer never pressed Reserve).
      const locked = productModel.compareAndSetStatus(product.id, 'Available', 'Sold');
      if (!locked) throw ApiError.conflict(`"${product.name}" was just taken by someone else.`);
    }

    soldItems.push(product);
  });

  // Server-side totals.
  const subtotal = soldItems.reduce((sum, product) => sum + product.price, 0);
  const deliveryFee = payload.fulfillmentMethod === 'delivery' ? config.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  // Cash orders are simply "unpaid" until handover. Online payments wait in
  // "pending" until the simulated payment screen confirms them.
  const online = paymentService.isOnlinePayment(payload.paymentMethod);

  const orderId = orderModel.createOrder({
    userId: user.id,
    subtotal,
    deliveryFee,
    total,
    fulfillmentMethod: payload.fulfillmentMethod,
    paymentMethod: payload.paymentMethod,
    paymentStatus: online ? 'pending' : 'unpaid',
    orderStatus: 'Pending',
    recipientName: payload.recipientName,
    contactPhone: payload.contactPhone,
    deliveryAddress: payload.deliveryAddress,
    deliveryNotes: payload.deliveryNotes,
  });

  soldItems.forEach((product) => {
    orderModel.addItem(orderId, {
      productId: product.id,
      name: product.name,
      brand: product.brand,
      size: product.size,
      condition: product.condition,
      price: product.price,
      image: product.images[0] || null,
    });
  });

  return orderModel.findById(orderId);
});

/** Confirms the simulated GCash / Maya / PayPal payment for an order. */
const payOrder = db.transaction((user, orderId) => {
  const order = orderModel.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found.');
  if (order.userId !== user.id && user.role !== 'admin') {
    throw ApiError.forbidden('This order belongs to another customer.');
  }
  if (order.paymentStatus === 'paid') throw ApiError.badRequest('This order is already paid.');
  if (order.orderStatus === 'Cancelled') throw ApiError.badRequest('This order was cancelled.');
  if (!paymentService.isOnlinePayment(order.paymentMethod)) {
    throw ApiError.badRequest('This order is paid in cash on handover.');
  }

  const result = paymentService.confirmSimulatedPayment({
    method: order.paymentMethod,
    orderId: order.id,
    amount: order.total,
  });

  orderModel.updatePayment(order.id, {
    paymentStatus: 'paid',
    paymentReference: result.reference,
    orderStatus: 'Paid',
  });

  return { order: orderModel.findById(order.id), payment: result };
});

/**
 * Admin changes the order status.
 * Cancelling an order also puts its unique items back on the shop floor.
 */
const updateOrderStatus = db.transaction((orderId, nextStatus) => {
  const order = orderModel.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found.');
  if (order.orderStatus === nextStatus) return order;
  if (order.orderStatus === 'Cancelled') {
    throw ApiError.badRequest('A cancelled order cannot be changed.');
  }

  if (nextStatus === 'Cancelled') {
    order.items.forEach((item) => {
      productModel.compareAndSetStatus(item.productId, 'Sold', 'Available');
    });
  }

  // Handing over a cash order counts as receiving the money.
  if (nextStatus === 'Completed' && order.paymentStatus !== 'paid') {
    orderModel.updatePayment(order.id, {
      paymentStatus: 'paid',
      paymentReference: order.paymentReference || `CASH-${order.id}`,
      orderStatus: nextStatus,
    });
  }

  orderModel.updateStatus(orderId, nextStatus);
  return orderModel.findById(orderId);
});

module.exports = { placeOrder, payOrder, updateOrderStatus };
