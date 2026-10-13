/** Database access for the "concerns" table (returns / authenticity requests). */
const { db } = require('../config/database');

const concernModel = {
  create({ userId, orderId, type, description, supportingInfo }) {
    const now = new Date().toISOString();
    const info = db
      .prepare(
        `INSERT INTO concerns
           (userId, orderId, type, description, supportingInfo, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, 'Submitted', ?, ?)`
      )
      .run(userId, orderId, type, description, supportingInfo || null, now, now);
    return concernModel.findById(info.lastInsertRowid);
  },

  findById(id) {
    return db.prepare('SELECT * FROM concerns WHERE id = ?').get(id);
  },

  findByUser(userId) {
    return db.prepare('SELECT * FROM concerns WHERE userId = ? ORDER BY id DESC').all(userId);
  },

  findByOrder(orderId) {
    return db.prepare('SELECT * FROM concerns WHERE orderId = ? ORDER BY id DESC').all(orderId);
  },

  findAll({ status } = {}) {
    const filter = status ? 'WHERE c.status = ?' : '';
    const params = status ? [status] : [];
    return db
      .prepare(
        `SELECT c.*, u.name AS customerName, u.email AS customerEmail
         FROM concerns c JOIN users u ON u.id = c.userId
         ${filter}
         ORDER BY c.id DESC`
      )
      .all(...params);
  },

  update(id, { status, adminResponse }) {
    db.prepare(
      'UPDATE concerns SET status = ?, adminResponse = ?, updatedAt = ? WHERE id = ?'
    ).run(status, adminResponse || null, new Date().toISOString(), id);
    return concernModel.findById(id);
  },

  countOpen() {
    return db
      .prepare("SELECT COUNT(*) AS total FROM concerns WHERE status IN ('Submitted','Under Review')")
      .get().total;
  },
};

module.exports = concernModel;
