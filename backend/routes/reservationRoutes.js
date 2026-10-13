const express = require('express');
const reservationController = require('../controllers/reservationController');
const asyncHandler = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Every reservation action needs a logged-in customer.
router.use(requireAuth);

router.post('/', asyncHandler(reservationController.create));
router.get('/my', asyncHandler(reservationController.mine));
router.delete('/product/:productId', asyncHandler(reservationController.removeByProduct));
router.delete('/:id', asyncHandler(reservationController.remove));

module.exports = router;
