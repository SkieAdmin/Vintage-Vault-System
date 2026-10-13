/**
 * Kierre's Vintage Vault - API entry point.
 *
 * Start with:  npm run dev   (auto-restart)  or  npm start
 * The server listens on 0.0.0.0 so an Android phone on the same Wi-Fi can reach
 * it at http://<your-computer-IPv4>:5000/api
 */
const os = require('os');
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const config = require('./config/env');
const { initDatabase } = require('./config/database');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { startReservationSweeper } = require('./services/reservationService');

const app = express();

// The Expo app runs on a different origin, so CORS has to be open in development.
app.use(cors());
// Product photos are sent as base64, so allow a slightly bigger JSON body.
app.use(express.json({ limit: '6mb' }));
app.use(morgan('dev'));

// Uploaded product photos.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "Kierre's Vintage Vault API is running.",
    docs: '/api/health',
  });
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

/** Prints every LAN address so you can copy the right one into the mobile app. */
function printLanAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  Object.values(interfaces).forEach((list) => {
    (list || []).forEach((entry) => {
      if (entry.family === 'IPv4' && !entry.internal) addresses.push(entry.address);
    });
  });

  console.log('\n  Local:   http://localhost:%d/api', config.port);
  addresses.forEach((address) => {
    console.log('  Network: http://%s:%d/api   <-- use this one in frontend/config/api.js', address, config.port);
  });
  console.log('');
}

initDatabase();

app.listen(config.port, '0.0.0.0', () => {
  console.log(`\n  Kierre's Vintage Vault API started on port ${config.port}`);
  console.log(`  Reservation hold time: ${config.reservationMinutes} minutes`);
  printLanAddresses();

  // Frees items whose reservation ran out, even while nobody is using the app.
  startReservationSweeper();
});

module.exports = app;
