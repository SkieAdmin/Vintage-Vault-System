/** Dashboard, admin listings and the two simple reports. */
const productModel = require('../models/productModel');
const orderModel = require('../models/orderModel');
const reservationModel = require('../models/reservationModel');
const concernModel = require('../models/concernModel');
const userModel = require('../models/userModel');
const reservationService = require('../services/reservationService');
const { optionalString } = require('../utils/validators');

const adminController = {
  /** GET /api/admin/dashboard */
  dashboard(req, res) {
    reservationService.expireDueReservations();

    const inventory = productModel.countByStatus();
    const sales = orderModel.salesSummary();

    res.json({
      success: true,
      stats: {
        totalSales: sales.totalSales,
        totalOrders: sales.totalOrders,
        itemsSold: sales.itemsSold,
        completedOrders: sales.completedOrders,
        pendingOrders: sales.pendingOrders,
        availableItems: inventory.Available,
        reservedItems: inventory.Reserved,
        soldItems: inventory.Sold,
        activeReservations: reservationModel.countActive(),
        openConcerns: concernModel.countOpen(),
        customers: userModel.countCustomers(),
      },
      recentOrders: orderModel.findAll().slice(0, 5),
    });
  },

  /** GET /api/admin/orders?status=Pending */
  orders(req, res) {
    const status = optionalString(req.query.status, { max: 30 }) || undefined;
    res.json({ success: true, orders: orderModel.findAll({ status }) });
  },

  /** GET /api/admin/reservations?status=active|expired */
  reservations(req, res) {
    reservationService.expireDueReservations();
    const status = optionalString(req.query.status, { max: 20 }) || undefined;
    const reservations = reservationModel.findAll({ status }).map((reservation) => ({
      ...reservation,
      secondsRemaining:
        reservation.status === 'active' ? reservationService.secondsRemaining(reservation) : 0,
    }));
    res.json({ success: true, reservations });
  },

  /** DELETE /api/admin/reservations/:id - seller force-releases a hold. */
  releaseReservation(req, res) {
    const id = Number(req.params.id);
    reservationService.releaseReservation(req.user.id, id, { isAdmin: true });
    res.json({ success: true, message: 'Reservation released.' });
  },

  /** GET /api/admin/concerns */
  concerns(req, res) {
    const status = optionalString(req.query.status, { max: 30 }) || undefined;
    res.json({ success: true, concerns: concernModel.findAll({ status }) });
  },

  /** GET /api/admin/reports/sales */
  salesReport(req, res) {
    const summary = orderModel.salesSummary();
    const orders = orderModel.findAll();
    const paidOrders = orders.filter((order) => order.orderStatus !== 'Cancelled');

    res.json({
      success: true,
      summary: {
        ...summary,
        averageOrderValue: paidOrders.length
          ? Math.round((summary.totalSales / paidOrders.length) * 100) / 100
          : 0,
      },
      byDay: orderModel.salesByDay(7),
      recentSales: paidOrders.slice(0, 20),
    });
  },

  /** GET /api/admin/reports/inventory */
  inventoryReport(req, res) {
    reservationService.expireDueReservations();

    const counts = productModel.countByStatus();
    const allProducts = productModel.findAll();
    const totalValue = allProducts
      .filter((product) => product.status !== 'Sold')
      .reduce((sum, product) => sum + product.price, 0);

    res.json({
      success: true,
      counts,
      totalItems: allProducts.length,
      unsoldStockValue: totalValue,
      byCategory: productModel.categoriesWithCounts(),
      available: allProducts.filter((product) => product.status === 'Available'),
      reserved: allProducts.filter((product) => product.status === 'Reserved'),
      sold: allProducts.filter((product) => product.status === 'Sold'),
    });
  },
};

module.exports = adminController;
