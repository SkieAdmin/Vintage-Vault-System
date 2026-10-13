const express = require('express');
const orderController = require('../controllers/orderController');
const asyncHandler = require('../middleware/asyncHandler');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.post('/', asyncHandler(orderController.create));
router.get('/my', asyncHandler(orderController.mine));
router.get('/:id', asyncHandler(orderController.getById));
router.post('/:id/pay', asyncHandler(orderController.pay));
router.put('/:id/status', requireAdmin, asyncHandler(orderController.updateStatus));

module.exports = router;
