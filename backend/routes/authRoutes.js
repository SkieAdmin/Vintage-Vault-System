const express = require('express');
const authController = require('../controllers/authController');
const asyncHandler = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.get('/me', requireAuth, asyncHandler(authController.me));
router.put('/profile', requireAuth, asyncHandler(authController.updateProfile));

module.exports = router;
