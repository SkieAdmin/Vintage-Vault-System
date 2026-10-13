/** Product catalog: public browsing + admin management. */
const productModel = require('../models/productModel');
const reservationModel = require('../models/reservationModel');
const reservationService = require('../services/reservationService');
const ApiError = require('../utils/ApiError');
const {
  requireString,
  optionalString,
  requirePositiveNumber,
  requireId,
  requireOneOf,
  normalizeImages,
} = require('../utils/validators');
const { CONDITIONS, PRODUCT_STATUSES, CATEGORIES } = require('../utils/constants');

/** Builds the product body shared by create and update. */
function readProductBody(body) {
  return {
    name: requireString(body.name, 'Item name', { min: 2, max: 120 }),
    description: optionalString(body.description, { max: 1500 }),
    brand: optionalString(body.brand, { max: 60 }),
    category: requireString(body.category, 'Category', { max: 40 }),
    size: optionalString(body.size, { max: 20 }),
    condition: requireOneOf(body.condition, CONDITIONS, 'Condition'),
    conditionNotes: optionalString(body.conditionNotes, { max: 500 }),
    price: requirePositiveNumber(body.price, 'Price'),
    images: normalizeImages(body.images),
    featured: Boolean(body.featured),
  };
}

const productController = {
  list(req, res) {
    // Expire holds first so the shop never shows a stale "Reserved" badge.
    reservationService.expireDueReservations();

    const products = productModel.findAll({
      search: optionalString(req.query.search, { max: 60 }) || undefined,
      category: optionalString(req.query.category, { max: 40 }) || undefined,
      condition: optionalString(req.query.condition, { max: 20 }) || undefined,
      status: optionalString(req.query.status, { max: 20 }) || undefined,
      featured: req.query.featured === 'true',
      sort: req.query.sort,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });

    res.json({ success: true, count: products.length, products });
  },

  /** Everything the home screen needs, in one request. */
  home(req, res) {
    reservationService.expireDueReservations();
    res.json({
      success: true,
      featured: productModel.findAll({ featured: true, status: 'Available', limit: 6 }),
      newArrivals: productModel.findAll({ status: 'Available', limit: 4 }),
      // "Recently added" also shows reserved/sold pieces, so the shop feels alive.
      recentlyAdded: productModel.findAll({ limit: 8 }),
      categories: productModel.categoriesWithCounts(),
      conditions: CONDITIONS,
    });
  },

  getById(req, res) {
    reservationService.expireDueReservations();

    const id = requireId(req.params.id, 'product id');
    const product = productModel.findById(id);
    if (!product) throw ApiError.notFound('Item not found.');

    // If the item is reserved, tell the app how long is left and whether the
    // hold belongs to the logged-in customer.
    let reservation = null;
    if (product.status === 'Reserved') {
      const active = reservationModel.findActiveByProduct(id);
      if (active) {
        reservation = {
          id: active.id,
          expiresAt: active.expiresAt,
          secondsRemaining: reservationService.secondsRemaining(active),
          mine: Boolean(req.user && active.userId === req.user.id),
        };
      }
    }

    res.json({ success: true, product, reservation });
  },

  /** Small helper so the app never hard-codes the filter lists. */
  options(req, res) {
    res.json({
      success: true,
      categories: CATEGORIES,
      conditions: CONDITIONS,
      statuses: PRODUCT_STATUSES,
    });
  },

  create(req, res) {
    const body = readProductBody(req.body);
    const product = productModel.create({ ...body, status: 'Available' });
    res.status(201).json({ success: true, product });
  },

  update(req, res) {
    const id = requireId(req.params.id, 'product id');
    const existing = productModel.findById(id);
    if (!existing) throw ApiError.notFound('Item not found.');

    const body = readProductBody(req.body);
    // The status is controlled by reservations and orders, so the admin can only
    // set it explicitly and never on an item that is currently reserved.
    let status = existing.status;
    if (req.body.status && req.body.status !== existing.status) {
      if (existing.status === 'Reserved') {
        throw ApiError.conflict('Release the active reservation before changing the status.');
      }
      status = requireOneOf(req.body.status, PRODUCT_STATUSES, 'Status');
    }

    const product = productModel.update(id, { ...body, status });
    res.json({ success: true, product });
  },

  remove(req, res) {
    const id = requireId(req.params.id, 'product id');
    const product = productModel.findById(id);
    if (!product) throw ApiError.notFound('Item not found.');
    if (product.status === 'Reserved') {
      throw ApiError.conflict('This item is currently reserved and cannot be deleted.');
    }
    if (product.status === 'Sold') {
      throw ApiError.conflict('Sold items are kept for the sales history.');
    }

    productModel.remove(id);
    res.json({ success: true, message: 'Item deleted.' });
  },
};

module.exports = productController;
