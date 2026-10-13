/**
 * Fills the database with the demo accounts and the sample thrift inventory.
 *
 *   npm run seed     -> adds anything that is missing (safe to re-run)
 *   npm run reset    -> wipes every table first, then seeds from scratch
 */
const bcrypt = require('bcryptjs');
const { db, initDatabase, dbPath } = require('../config/database');
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
const sampleProducts = require('./sampleProducts');

const DEMO_USERS = [
  {
    name: 'Kierre (Seller)',
    email: 'admin@kierresvault.com',
    password: 'admin123',
    phone: '09171234567',
    role: 'admin',
  },
  {
    name: 'Maria Santos',
    email: 'customer@example.com',
    password: 'customer123',
    phone: '09181234567',
    role: 'customer',
  },
  {
    name: 'Josh Reyes',
    email: 'josh@example.com',
    password: 'customer123',
    phone: '09991234567',
    role: 'customer',
  },
];

/**
 * Order matters: a child table must be emptied before the table it points at,
 * otherwise SQLite refuses the delete with "FOREIGN KEY constraint failed".
 * concerns -> orders, order_items -> orders/products, reservations -> products.
 */
const resetTables = db.transaction(() => {
  db.exec(`
    DELETE FROM order_items;
    DELETE FROM concerns;
    DELETE FROM orders;
    DELETE FROM reservations;
    DELETE FROM products;
    DELETE FROM users;
    DELETE FROM sqlite_sequence;
  `);
  console.log('  All tables cleared.');
});

function seedUsers() {
  let created = 0;
  DEMO_USERS.forEach((user) => {
    if (userModel.findByEmail(user.email)) return;
    userModel.create({ ...user, password: bcrypt.hashSync(user.password, 10) });
    created += 1;
  });
  console.log(`  Users: ${created} created, ${DEMO_USERS.length - created} already existed.`);
}

function seedProducts() {
  const existing = productModel.findAll();
  const existingNames = new Set(existing.map((product) => product.name));

  let created = 0;
  sampleProducts.forEach((product) => {
    if (existingNames.has(product.name)) return;
    productModel.create({ ...product, status: 'Available' });
    created += 1;
  });
  console.log(`  Products: ${created} created, ${sampleProducts.length - created} already existed.`);
}

function run() {
  const shouldReset = process.argv.includes('--reset');

  console.log(`\n  Seeding database at ${dbPath}`);
  initDatabase();
  if (shouldReset) resetTables();

  seedUsers();
  seedProducts();

  console.log('\n  Demo accounts');
  console.log('  ------------------------------------------');
  DEMO_USERS.forEach((user) => {
    console.log(`  ${user.role.padEnd(8)} ${user.email.padEnd(28)} ${user.password}`);
  });
  console.log('\n  Done.\n');
}

run();
