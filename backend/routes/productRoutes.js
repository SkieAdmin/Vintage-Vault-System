const express = require('express');
const productController = require('../controllers/productController');
const asyncHandler = require('../middleware/asyncHandler');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public browsing.
router.get('/', optionalAuth, asyncHandler(productController.list));
router.get('/home', optionalAuth, asyncHandler(productController.home));
router.get('/options', asyncHandler(productController.options));
router.get('/:id', optionalAuth, asyncHandler(productController.getById));

// Seller / admin only.
router.post('/', requireAuth, requireAdmin, asyncHandler(productController.create));
router.put('/:id', requireAuth, requireAdmin, asyncHandler(productController.update));
router.delete('/:id', requireAuth, requireAdmin, asyncHandler(productController.remove));

module.exports = router;
