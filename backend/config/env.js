/**
 * Loads the .env file once and exposes the settings the rest of the app needs.
 * Every value has a sensible default so the project still runs if the student
 * forgets to create a .env file.
 */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const config = {
  port: Number(process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET || 'kierres_vintage_vault_dev_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  databaseUrl: process.env.DATABASE_URL || './data/vintagevault.db',
  reservationMinutes: Number(process.env.RESERVATION_MINUTES) || 15,
  deliveryFee: Number(process.env.DELIVERY_FEE) || 80,
};

if (!process.env.JWT_SECRET) {
  console.warn('[config] JWT_SECRET is not set - using the development default.');
}

module.exports = config;
