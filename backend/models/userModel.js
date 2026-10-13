/** Database access for the "users" table. */
const { db } = require('../config/database');

/** Removes the password hash before a user object leaves the server. */
function toPublicUser(row) {
  if (!row) return null;
  const { password, ...safe } = row;
  return safe;
}

const userModel = {
  create({ name, email, password, phone, role = 'customer' }) {
    const info = db
      .prepare(
        `INSERT INTO users (name, email, password, phone, role, createdAt)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(name, email, password, phone || '', role, new Date().toISOString());
    return userModel.findById(info.lastInsertRowid);
  },

  findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).toLowerCase());
  },

  findById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  updateProfile(id, { name, phone }) {
    db.prepare('UPDATE users SET name = ?, phone = ? WHERE id = ?').run(name, phone, id);
    return userModel.findById(id);
  },

  countCustomers() {
    return db.prepare("SELECT COUNT(*) AS total FROM users WHERE role = 'customer'").get().total;
  },

  toPublicUser,
};

module.exports = userModel;
