/** Database access for the "orders" and "order_items" tables. */
const { db } = require('../config/database');

function attachItems(order) {
  if (!order) return null;
  const items = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(order.id);
  return { ...order, items };
}

const orderModel = {
  /** Inserts the order header. Items are inserted separately, inside the same transaction. */
  createOrder(order) {
    const now = new Date().toISOString();
    const info = db
      .prepare(
        `INSERT INTO orders
           (userId, subtotal, deliveryFee, total, fulfillmentMethod, paymentMethod,
            paymentStatus, paymentReference, orderStatus, recipientName, contactPhone,
            deliveryAddress, deliveryNotes, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        order.userId,
        order.subtotal,
        order.deliveryFee,
        order.total,
        order.fulfillmentMethod,
        order.paymentMethod,
        order.paymentStatus,
        order.paymentReference || null,
        order.orderStatus,
        order.recipientName,
        order.contactPhone,
        order.deliveryAddress || null,
        order.deliveryNotes || null,
        now,
        now
      );
    return info.lastInsertRowid;
  },

  addItem(orderId, item) {
    db.prepare(
      `INSERT INTO order_items (orderId, productId, name, brand, size, condition, price, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      orderId,
      item.productId,
      item.name,
      item.brand,
      item.size,
      item.condition,
      item.price,
      item.image || null
    );
  },

  findById(id) {
    return attachItems(db.prepare('SELECT * FROM orders WHERE id = ?').get(id));
  },

  /** Same as findById but also includes the customer, for the admin screens. */
  findByIdWithCustomer(id) {
    const order = db
      .prepare(
        `SELECT o.*, u.name AS customerName, u.email AS customerEmail, u.phone AS customerPhone
         FROM orders o JOIN users u ON u.id = o.userId
         WHERE o.id = ?`
      )
      .get(id);
    return attachItems(order);
  },

  findByUser(userId) {
    return db
      .prepare('SELECT * FROM orders WHERE userId = ? ORDER BY id DESC')
      .all(userId)
      .map(attachItems);
  },

  findAll({ status } = {}) {
    const filter = status ? 'WHERE o.orderStatus = ?' : '';
    const params = status ? [status] : [];
    return db
      .prepare(
        `SELECT o.*, u.name AS customerName, u.email AS customerEmail
         FROM orders o JOIN users u ON u.id = o.userId
         ${filter}
         ORDER BY o.id DESC`
      )
      .all(...params)
      .map(attachItems);
  },

  updateStatus(id, orderStatus) {
    return (
      db
        .prepare('UPDATE orders SET orderStatus = ?, updatedAt = ? WHERE id = ?')
        .run(orderStatus, new Date().toISOString(), id).changes > 0
    );
  },

  updatePayment(id, { paymentStatus, paymentReference, orderStatus }) {
    return (
      db
        .prepare(
          `UPDATE orders
           SET paymentStatus = ?, paymentReference = ?, orderStatus = ?, updatedAt = ?
           WHERE id = ?`
        )
        .run(paymentStatus, paymentReference, orderStatus, new Date().toISOString(), id).changes > 0
    );
  },

  /** Numbers for the admin dashboard. Cancelled orders never count as sales. */
  salesSummary() {
    const row = db
      .prepare(
        `SELECT COUNT(*) AS totalOrders,
                COALESCE(SUM(total), 0) AS totalSales
         FROM orders
         WHERE orderStatus != 'Cancelled'`
      )
      .get();
    const completed = db
      .prepare("SELECT COUNT(*) AS total FROM orders WHERE orderStatus = 'Completed'").get().total;
    const pending = db
      .prepare(
        "SELECT COUNT(*) AS total FROM orders WHERE orderStatus NOT IN ('Completed','Cancelled')"
      )
      .get().total;
    const itemsSold = db
      .prepare(
        `SELECT COUNT(*) AS total
         FROM order_items oi JOIN orders o ON o.id = oi.orderId
         WHERE o.orderStatus != 'Cancelled'`
      )
      .get().total;
    return { ...row, completedOrders: completed, pendingOrders: pending, itemsSold };
  },

  /** Sales grouped per day, used by the sales report screen. */
  salesByDay(limit = 7) {
    return db
      .prepare(
        `SELECT substr(createdAt, 1, 10) AS day,
                COUNT(*) AS orders,
                COALESCE(SUM(total), 0) AS sales
         FROM orders
         WHERE orderStatus != 'Cancelled'
         GROUP BY day
         ORDER BY day DESC
         LIMIT ?`
      )
      .all(limit);
  },
};

module.exports = orderModel;
