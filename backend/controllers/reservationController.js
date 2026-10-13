/** Customer-facing reservation endpoints. */
const reservationModel = require('../models/reservationModel');
const reservationService = require('../services/reservationService');
const { requireId } = require('../utils/validators');

/** Adds the live countdown value so the app does not have to trust its own clock. */
function withCountdown(reservation) {
  return {
    ...reservation,
    secondsRemaining:
      reservation.status === 'active' ? reservationService.secondsRemaining(reservation) : 0,
  };
}

const reservationController = {
  /** POST /api/reservations - hold one item for the configured number of minutes. */
  create(req, res) {
    const productId = requireId(req.body.productId, 'product id');
    const reservation = reservationService.reserveProduct(req.user.id, productId);
    res.status(201).json({
      success: true,
      message: 'Item reserved. Complete your order before the timer runs out.',
      reservation: withCountdown(reservation),
    });
  },

  /** GET /api/reservations/my */
  mine(req, res) {
    reservationService.expireDueReservations();
    const activeOnly = req.query.active === 'true';
    const reservations = reservationModel
      .findByUser(req.user.id, { activeOnly })
      .map(withCountdown);
    res.json({ success: true, count: reservations.length, reservations });
  },

  /** DELETE /api/reservations/:id - customer cancels their own hold. */
  remove(req, res) {
    const id = requireId(req.params.id, 'reservation id');
    reservationService.releaseReservation(req.user.id, id);
    res.json({ success: true, message: 'Reservation released.' });
  },

  /** DELETE /api/reservations/product/:productId - used when removing a cart item. */
  removeByProduct(req, res) {
    const productId = requireId(req.params.productId, 'product id');
    const released = reservationService.releaseByProduct(req.user.id, productId);
    res.json({
      success: true,
      released,
      message: released ? 'Reservation released.' : 'You had no active hold on that item.',
    });
  },
};

module.exports = reservationController;
