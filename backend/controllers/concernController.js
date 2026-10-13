/** Return / authenticity concern requests. */
const concernModel = require('../models/concernModel');
const orderModel = require('../models/orderModel');
const ApiError = require('../utils/ApiError');
const { requireString, optionalString, requireId, requireOneOf } = require('../utils/validators');
const { CONCERN_TYPES, CONCERN_STATUSES } = require('../utils/constants');

const concernController = {
  /** POST /api/concerns */
  create(req, res) {
    const orderId = requireId(req.body.orderId, 'order id');
    const type = requireOneOf(req.body.type, CONCERN_TYPES, 'Concern type');
    const description = requireString(req.body.description, 'Description', { min: 10, max: 1000 });
    const supportingInfo = optionalString(req.body.supportingInfo, { max: 500 });

    const order = orderModel.findById(orderId);
    if (!order) throw ApiError.notFound('Order not found.');
    if (order.userId !== req.user.id) {
      throw ApiError.forbidden('You can only report a concern on your own order.');
    }

    const concern = concernModel.create({
      userId: req.user.id,
      orderId,
      type,
      description,
      supportingInfo,
    });

    res.status(201).json({
      success: true,
      message: 'Your concern has been submitted. The seller will review it.',
      concern,
    });
  },

  /** GET /api/concerns/my */
  mine(req, res) {
    res.json({ success: true, concerns: concernModel.findByUser(req.user.id) });
  },

  /** GET /api/concerns/:id */
  getById(req, res) {
    const id = requireId(req.params.id, 'concern id');
    const concern = concernModel.findById(id);
    if (!concern) throw ApiError.notFound('Concern not found.');
    if (concern.userId !== req.user.id && req.user.role !== 'admin') {
      throw ApiError.forbidden('This concern belongs to another customer.');
    }
    res.json({ success: true, concern });
  },

  /** PUT /api/concerns/:id - admin review (guarded by the route). */
  update(req, res) {
    const id = requireId(req.params.id, 'concern id');
    if (!concernModel.findById(id)) throw ApiError.notFound('Concern not found.');

    const status = requireOneOf(req.body.status, CONCERN_STATUSES, 'Status');
    const adminResponse = optionalString(req.body.adminResponse, { max: 1000 });
    res.json({ success: true, concern: concernModel.update(id, { status, adminResponse }) });
  },
};

module.exports = concernController;
