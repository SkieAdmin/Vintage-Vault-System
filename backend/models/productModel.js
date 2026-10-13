/** Database access for the "products" table. */
const { db } = require('../config/database');

/** Images are stored as a JSON string in SQLite, so parse them on the way out. */
function mapProduct(row) {
  if (!row) return null;
  let images = [];
  try {
    images = JSON.parse(row.images || '[]');
  } catch (error) {
    images = [];
  }
  return { ...row, images, featured: Boolean(row.featured) };
}

const productModel = {
  /**
   * Flexible product listing used by the shop, search and admin screens.
   * Every filter is optional.
   */
  findAll({ search, category, condition, status, featured, sort, limit } = {}) {
    const where = [];
    const params = [];

    if (search) {
      where.push('(name LIKE ? OR brand LIKE ? OR description LIKE ? OR category LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }
    if (category) {
      where.push('category = ?');
      params.push(category);
    }
    if (condition) {
      where.push('condition = ?');
      params.push(condition);
    }
    if (status) {
      where.push('status = ?');
      params.push(status);
    }
    if (featured) {
      where.push('featured = 1');
    }

    const orderBy =
      sort === 'price_asc' ? 'price ASC' : sort === 'price_desc' ? 'price DESC' : 'id DESC';

    let sql = `SELECT * FROM products`;
    if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
    sql += ` ORDER BY ${orderBy}`;
    if (limit) sql += ` LIMIT ${Number(limit)}`;

    return db.prepare(sql).all(...params).map(mapProduct);
  },

  findById(id) {
    return mapProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(id));
  },

  findManyByIds(ids) {
    if (!ids.length) return [];
    const placeholders = ids.map(() => '?').join(',');
    return db
      .prepare(`SELECT * FROM products WHERE id IN (${placeholders})`)
      .all(...ids)
      .map(mapProduct);
  },

  create(product) {
    const info = db
      .prepare(
        `INSERT INTO products
           (name, description, brand, category, size, condition, conditionNotes,
            price, images, status, featured, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        product.name,
        product.description,
        product.brand,
        product.category,
        product.size,
        product.condition,
        product.conditionNotes,
        product.price,
        JSON.stringify(product.images || []),
        product.status || 'Available',
        product.featured ? 1 : 0,
        new Date().toISOString()
      );
    return productModel.findById(info.lastInsertRowid);
  },

  update(id, product) {
    db.prepare(
      `UPDATE products SET
         name = ?, description = ?, brand = ?, category = ?, size = ?,
         condition = ?, conditionNotes = ?, price = ?, images = ?, status = ?, featured = ?
       WHERE id = ?`
    ).run(
      product.name,
      product.description,
      product.brand,
      product.category,
      product.size,
      product.condition,
      product.conditionNotes,
      product.price,
      JSON.stringify(product.images || []),
      product.status,
      product.featured ? 1 : 0,
      id
    );
    return productModel.findById(id);
  },

  remove(id) {
    return db.prepare('DELETE FROM products WHERE id = ?').run(id).changes > 0;
  },

  setStatus(id, status) {
    return db.prepare('UPDATE products SET status = ? WHERE id = ?').run(status, id).changes > 0;
  },

  /**
   * The heart of the reservation feature.
   *
   * The "AND status = ?" part means the UPDATE only succeeds when the product is
   * still in the state we expect. SQLite runs one write statement at a time, so
   * if two customers hit this at the same moment, exactly one UPDATE reports
   * changes === 1 and the other reports 0. No frontend check can be trusted for
   * this - the database is the single source of truth.
   */
  compareAndSetStatus(id, expectedStatus, nextStatus) {
    const info = db
      .prepare('UPDATE products SET status = ? WHERE id = ? AND status = ?')
      .run(nextStatus, id, expectedStatus);
    return info.changes === 1;
  },

  countByStatus() {
    const rows = db.prepare('SELECT status, COUNT(*) AS total FROM products GROUP BY status').all();
    const counts = { Available: 0, Reserved: 0, Sold: 0 };
    rows.forEach((row) => {
      counts[row.status] = row.total;
    });
    return counts;
  },

  categoriesWithCounts() {
    return db
      .prepare(
        `SELECT category, COUNT(*) AS total
         FROM products
         WHERE status != 'Sold' AND category IS NOT NULL AND category != ''
         GROUP BY category
         ORDER BY total DESC`
      )
      .all();
  },

  mapProduct,
};

module.exports = productModel;
