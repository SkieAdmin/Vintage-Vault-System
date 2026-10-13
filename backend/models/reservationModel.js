/** Database access for the "reservations" table. */
const { db } = require('../config/database');
const { mapProduct } = require('./productModel');

/** Joins the product row into the reservation so the app can render a card. */
const SELECT_WITH_PRODUCT = `
  SELECT r.*,
         p.name AS p_name, p.brand AS p_brand, p.size AS p_size, p.price AS p_price,
         p.condition AS p_condition, p.images AS p_images, p.status AS p_status,
         p.category AS p_category
  FROM reservations r
  JOIN products p ON p.id = r.productId
`;

function mapReservation(row) {
  if (!row) return null;
  const { p_name, p_brand, p_size, p_price, p_condition, p_images, p_status, p_category, ...rest } =
    row;
  return {
    ...rest,
    product: mapProduct({
      id: row.productId,
      name: p_name,
      brand: p_brand,
      size: p_size,
      price: p_price,
      condition: p_condition,
      images: p_images,
      status: p_status,
      category: p_category,
    }),
  };
}

const reservationModel = {
  create({ userId, productId, reservedAt, expiresAt }) {
    const info = db
      .prepare(
        `INSERT INTO reservations (userId, productId, reservedAt, expiresAt, status)
         VALUES (?, ?, ?, ?, 'active')`
      )
      .run(userId, productId, reservedAt, expiresAt);
    return reservationModel.findById(info.lastInsertRowid);
  },

  findById(id) {
    return mapReservation(db.prepare(`${SELECT_WITH_PRODUCT} WHERE r.id = ?`).get(id));
  },

  findActiveByProduct(productId) {
    return mapReservation(
      db
        .prepare(`${SELECT_WITH_PRODUCT} WHERE r.productId = ? AND r.status = 'active'`)
        .get(productId)
    );
  },

  findActiveByUserAndProduct(userId, productId) {
    return mapReservation(
      db
        .prepare(
          `${SELECT_WITH_PRODUCT}
           WHERE r.userId = ? AND r.productId = ? AND r.status = 'active'`
        )
        .get(userId, productId)
    );
  },

  findByUser(userId, { activeOnly = false } = {}) {
    const filter = activeOnly ? "AND r.status = 'active'" : '';
    return db
      .prepare(`${SELECT_WITH_PRODUCT} WHERE r.userId = ? ${filter} ORDER BY r.id DESC`)
      .all(userId)
      .map(mapReservation);
  },

  /** Admin view: every reservation, newest first, with the customer name. */
  findAll({ status } = {}) {
    const filter = status ? 'WHERE r.status = ?' : '';
    const params = status ? [status] : [];
    return db
      .prepare(
        `SELECT r.*, u.name AS customerName, u.email AS customerEmail,
                p.name AS p_name, p.brand AS p_brand, p.size AS p_size, p.price AS p_price,
                p.condition AS p_condition, p.images AS p_images, p.status AS p_status,
                p.category AS p_category
         FROM reservations r
         JOIN products p ON p.id = r.productId
         JOIN users u    ON u.id = r.userId
         ${filter}
         ORDER BY r.id DESC`
      )
      .all(...params)
      .map(mapReservation);
  },

  setStatus(id, status) {
    return db.prepare('UPDATE reservations SET status = ? WHERE id = ?').run(status, id).changes > 0;
  },

  /** Returns every active reservation whose expiry time has already passed. */
  findExpiredActive(nowIso) {
    return db
      .prepare("SELECT * FROM reservations WHERE status = 'active' AND expiresAt <= ?")
      .all(nowIso);
  },

  countActive() {
    return db.prepare("SELECT COUNT(*) AS total FROM reservations WHERE status = 'active'").get()
      .total;
  },
};

module.exports = reservationModel;
