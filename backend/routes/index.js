/** Mounts every feature router under /api. */
const express = require('express');

const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/products', require('./productRoutes'));
router.use('/reservations', require('./reservationRoutes'));
router.use('/orders', require('./orderRoutes'));
router.use('/concerns', require('./concernRoutes'));
router.use('/admin', require('./adminRoutes'));

/** Handy for checking from the phone's browser that the API is reachable. */
router.get('/health', (req, res) => {
  res.json({ success: true, service: "Kierre's Vintage Vault API", time: new Date().toISOString() });
});

module.exports = router;
