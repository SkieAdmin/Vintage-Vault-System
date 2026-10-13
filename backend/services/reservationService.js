/**
 * Reservation rules for one-of-a-kind thrift items.
 *
 * Why this file exists
 * --------------------
 * Every product has exactly one piece of stock, so two customers must never be
 * able to hold or buy the same item. All of that logic lives here, on the
 * server, inside SQL transactions. The mobile app only *displays* the result -
 * it never decides whether a reservation is allowed.
 *
 * How the race condition is prevented
 * -----------------------------------
 * 1. `productModel.compareAndSetStatus()` runs
 *      UPDATE products SET status='Reserved' WHERE id=? AND status='Available'
 *    SQLite executes one write statement at a time, so if two requests arrive
 *    together only ONE of them reports `changes === 1`. The loser gets 0 and is
 *    rejected with HTTP 409.
 * 2. The whole reserve step runs inside `db.transaction(...)`, so the status
 *    flip and the reservation row are written together or not at all.
 * 3. A partial UNIQUE index (`idx_one_active_reservation`) makes a second active
 *    reservation for the same product impossible at the database level, even if
 *    somebody later introduces a bug in this file.
 */
const { db } = require('../config/database');
const config = require('../config/env');
const productModel = require('../models/productModel');
const reservationModel = require('../models/reservationModel');
const ApiError = require('../utils/ApiError');

/**
 * Releases every reservation whose expiry time has passed and puts the products
 * back on sale. Called by the background timer and also right before any
 * reservation/order decision, so the data is never stale.
 */
const expireDueReservations = db.transaction(() => {
  const now = new Date().toISOString();
  const due = reservationModel.findExpiredActive(now);

  due.forEach((reservation) => {
    reservationModel.setStatus(reservation.id, 'expired');
    // Only "un-reserve" the product if it is still Reserved. If it was already
    // sold (order completed at the last second) we must not touch it.
    productModel.compareAndSetStatus(reservation.productId, 'Reserved', 'Available');
  });

  return due.length;
});

/** Reserves one product for one customer, or throws a clear error. */
const reserveProduct = db.transaction((userId, productId) => {
  expireDueReservations();

  const product = productModel.findById(productId);
  if (!product) throw ApiError.notFound('That item no longer exists.');
  if (product.status === 'Sold') throw ApiError.conflict('This item has already been sold.');

  if (product.status === 'Reserved') {
    const active = reservationModel.findActiveByProduct(productId);
    // Reserving something you already hold is not an error - just return it.
    if (active && active.userId === userId) return active;
    throw ApiError.conflict('Someone else is currently reserving this item.');
  }

  // The atomic step. If another request won the race, changes === 0.
  const won = productModel.compareAndSetStatus(productId, 'Available', 'Reserved');
  if (!won) throw ApiError.conflict('Someone else just reserved this item.');

  const reservedAt = new Date();
  const expiresAt = new Date(reservedAt.getTime() + config.reservationMinutes * 60 * 1000);

  return reservationModel.create({
    userId,
    productId,
    reservedAt: reservedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });
});

/** Customer cancels their own hold (also used when removing an item from the cart). */
const releaseReservation = db.transaction((userId, reservationId, { isAdmin = false } = {}) => {
  const reservation = reservationModel.findById(reservationId);
  if (!reservation) throw ApiError.notFound('Reservation not found.');
  if (!isAdmin && reservation.userId !== userId) {
    throw ApiError.forbidden('This reservation belongs to another customer.');
  }
  if (reservation.status !== 'active') {
    throw ApiError.badRequest('This reservation is no longer active.');
  }

  reservationModel.setStatus(reservationId, 'cancelled');
  productModel.compareAndSetStatus(reservation.productId, 'Reserved', 'Available');
  return true;
});

/** Convenience for the cart: release by product instead of by reservation id. */
const releaseByProduct = db.transaction((userId, productId) => {
  const reservation = reservationModel.findActiveByUserAndProduct(userId, productId);
  if (!reservation) return false;
  return releaseReservation(userId, reservation.id);
});

/** Seconds left on a reservation (never negative). Used for the countdown timer. */
function secondsRemaining(reservation) {
  if (!reservation) return 0;
  const diff = new Date(reservation.expiresAt).getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 1000));
}

/**
 * Background sweeper.
 * The lazy check inside reserve/order already keeps the data correct, but this
 * makes expired items reappear in the shop on their own, which looks much better
 * during the demo.
 */
function startReservationSweeper(intervalMs = 20000) {
  const timer = setInterval(() => {
    try {
      const released = expireDueReservations();
      if (released > 0) {
        console.log(`[reservations] ${released} expired reservation(s) released.`);
      }
    } catch (error) {
      console.error('[reservations] sweeper failed:', error.message);
    }
  }, intervalMs);

  timer.unref?.();
  return timer;
}

module.exports = {
  expireDueReservations,
  reserveProduct,
  releaseReservation,
  releaseByProduct,
  secondsRemaining,
  startReservationSweeper,
};
