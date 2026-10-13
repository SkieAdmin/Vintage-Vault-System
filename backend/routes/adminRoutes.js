const express = require('express');
const adminController = require('../controllers/adminController');
const uploadController = require('../controllers/uploadController');
const asyncHandler = require('../middleware/asyncHandler');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Two guards: you must be logged in AND your role must be "admin".
router.use(requireAuth, requireAdmin);

router.get('/dashboard', asyncHandler(adminController.dashboard));
router.get('/orders', asyncHandler(adminController.orders));
router.get('/reservations', asyncHandler(adminController.reservations));
router.delete('/reservations/:id', asyncHandler(adminController.releaseReservation));
router.get('/concerns', asyncHandler(adminController.concerns));
router.get('/reports/sales', asyncHandler(adminController.salesReport));
router.get('/reports/inventory', asyncHandler(adminController.inventoryReport));
router.post('/uploads', asyncHandler(uploadController.uploadImage));

module.exports = router;
