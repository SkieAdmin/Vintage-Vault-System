/** JWT authentication + role authorisation. */
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const userModel = require('../models/userModel');
const ApiError = require('../utils/ApiError');

/** Creates the token the mobile app stores after login/register. */
function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/**
 * Reads "Authorization: Bearer <token>", verifies it and loads the user.
 * Any protected route must sit behind this.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(ApiError.unauthorized());

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = userModel.findById(payload.id);
    if (!user) return next(ApiError.unauthorized('Your account no longer exists.'));
    req.user = userModel.toPublicUser(user);
    return next();
  } catch (error) {
    return next(ApiError.unauthorized('Your session has expired. Please log in again.'));
  }
}

/**
 * Fills req.user when a valid token is present but never blocks the request.
 * Used on public screens that show a little extra when you are logged in
 * (e.g. "this item is reserved by YOU").
 */
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return next();

  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret);
    const user = userModel.findById(payload.id);
    if (user) req.user = userModel.toPublicUser(user);
  } catch (error) {
    // Ignore a bad token here - the route works without one.
  }
  return next();
}

/** Must run after requireAuth. Blocks anyone who is not the seller/admin. */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return next(ApiError.forbidden('Admin access only.'));
  }
  return next();
}

module.exports = { signToken, requireAuth, optionalAuth, requireAdmin };
