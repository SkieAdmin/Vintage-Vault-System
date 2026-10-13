/**
 * SQLite connection + schema.
 *
 * We use better-sqlite3 because it is synchronous, needs no database server,
 * and stores everything in a single file. That keeps the project easy to run
 * and easy to explain, while still being a real SQL database with real
 * transactions (which we need for the reservation race-condition handling).
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('./env');

const dbPath = path.isAbsolute(config.databaseUrl)
  ? config.databaseUrl
  : path.join(__dirname, '..', config.databaseUrl);

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

// WAL gives better concurrency; foreign keys are off by default in SQLite.
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/** Creates every table if it does not exist yet. Safe to call on every boot. */
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL UNIQUE,
      password   TEXT NOT NULL,
      phone      TEXT,
      role       TEXT NOT NULL DEFAULT 'customer',
      createdAt  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      name           TEXT NOT NULL,
      description    TEXT,
      brand          TEXT,
      category       TEXT,
      size           TEXT,
      condition      TEXT NOT NULL DEFAULT 'Good',
      conditionNotes TEXT,
      price          REAL NOT NULL,
      images         TEXT NOT NULL DEFAULT '[]',   -- JSON array of image URLs
      status         TEXT NOT NULL DEFAULT 'Available', -- Available | Reserved | Sold
      featured       INTEGER NOT NULL DEFAULT 0,
      createdAt      TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      userId     INTEGER NOT NULL,
      productId  INTEGER NOT NULL,
      reservedAt TEXT NOT NULL,
      expiresAt  TEXT NOT NULL,
      status     TEXT NOT NULL DEFAULT 'active', -- active | expired | cancelled | completed
      FOREIGN KEY (userId)    REFERENCES users(id),
      FOREIGN KEY (productId) REFERENCES products(id)
    );

    -- A product can only have ONE active reservation at a time.
    -- This partial unique index is the database-level guarantee that backs up
    -- the application logic in reservationService.js.
    CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_reservation
      ON reservations(productId) WHERE status = 'active';

    CREATE TABLE IF NOT EXISTS orders (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      userId            INTEGER NOT NULL,
      subtotal          REAL NOT NULL,
      deliveryFee       REAL NOT NULL DEFAULT 0,
      total             REAL NOT NULL,
      fulfillmentMethod TEXT NOT NULL,             -- pickup | delivery
      paymentMethod     TEXT NOT NULL,             -- gcash | maya | paypal | cash_on_pickup | cash_on_delivery
      paymentStatus     TEXT NOT NULL DEFAULT 'unpaid', -- unpaid | pending | paid
      paymentReference  TEXT,
      orderStatus       TEXT NOT NULL DEFAULT 'Pending',
      recipientName     TEXT,
      contactPhone      TEXT,
      deliveryAddress   TEXT,
      deliveryNotes     TEXT,
      createdAt         TEXT NOT NULL,
      updatedAt         TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    -- Snapshot of the product at the moment of purchase, so sales history stays
    -- correct even if the admin later edits the product.
    CREATE TABLE IF NOT EXISTS order_items (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId   INTEGER NOT NULL,
      productId INTEGER NOT NULL,
      name      TEXT NOT NULL,
      brand     TEXT,
      size      TEXT,
      condition TEXT,
      price     REAL NOT NULL,
      image     TEXT,
      FOREIGN KEY (orderId)   REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (productId) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS concerns (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      userId         INTEGER NOT NULL,
      orderId        INTEGER NOT NULL,
      type           TEXT NOT NULL,
      description    TEXT NOT NULL,
      supportingInfo TEXT,
      status         TEXT NOT NULL DEFAULT 'Submitted',
      adminResponse  TEXT,
      createdAt      TEXT NOT NULL,
      updatedAt      TEXT NOT NULL,
      FOREIGN KEY (userId)  REFERENCES users(id),
      FOREIGN KEY (orderId) REFERENCES orders(id)
    );

    CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
    CREATE INDEX IF NOT EXISTS idx_orders_user     ON orders(userId);
    CREATE INDEX IF NOT EXISTS idx_items_order     ON order_items(orderId);
    CREATE INDEX IF NOT EXISTS idx_concerns_user   ON concerns(userId);
  `);
}

module.exports = { db, initDatabase, dbPath };
