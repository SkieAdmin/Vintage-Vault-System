const express = require('express');
const concernController = require('../controllers/concernController');
const asyncHandler = require('../middleware/asyncHandler');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.post('/', asyncHandler(concernController.create));
router.get('/my', asyncHandler(concernController.mine));
router.get('/:id', asyncHandler(concernController.getById));
router.put('/:id', requireAdmin, asyncHandler(concernController.update));

module.exports = router;
