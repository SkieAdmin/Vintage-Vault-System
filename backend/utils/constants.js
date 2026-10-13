/** Shared value lists used by validation and by the admin screens. */

const ROLES = ['customer', 'admin'];

const PRODUCT_STATUSES = ['Available', 'Reserved', 'Sold'];

const CONDITIONS = ['Like New', 'Excellent', 'Good', 'Fair'];

const CATEGORIES = [
  'Jackets',
  'Tops',
  'Bottoms',
  'Knitwear',
  'Bags',
  'Shoes',
  'Accessories',
];

const FULFILLMENT_METHODS = ['pickup', 'delivery'];

const PAYMENT_METHODS = ['gcash', 'maya', 'paypal', 'cash_on_pickup', 'cash_on_delivery'];

/** Payment methods that go through the simulated online payment screen. */
const ONLINE_PAYMENT_METHODS = ['gcash', 'maya', 'paypal'];

const ORDER_STATUSES = [
  'Pending',
  'Paid',
  'Preparing',
  'Ready for Pickup',
  'Out for Delivery',
  'Completed',
  'Cancelled',
];

const CONCERN_TYPES = [
  'Return Request',
  'Authenticity Concern',
  'Item Condition Issue',
  'Wrong Item',
  'Other',
];

const CONCERN_STATUSES = [
  'Submitted',
  'Under Review',
  'Approved',
  'Rejected',
  'Resolved',
];

module.exports = {
  ROLES,
  PRODUCT_STATUSES,
  CONDITIONS,
  CATEGORIES,
  FULFILLMENT_METHODS,
  PAYMENT_METHODS,
  ONLINE_PAYMENT_METHODS,
  ORDER_STATUSES,
  CONCERN_TYPES,
  CONCERN_STATUSES,
};
