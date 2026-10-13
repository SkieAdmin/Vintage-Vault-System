/**
 * Tiny hand-written validation helpers.
 * A validation library would work too, but this keeps the dependency list short
 * and makes it obvious what is being checked.
 */
const ApiError = require('./ApiError');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requireString(value, field, { min = 1, max = 2000 } = {}) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (text.length < min) throw ApiError.badRequest(`${field} is required.`);
  if (text.length > max) throw ApiError.badRequest(`${field} is too long.`);
  return text;
}

function optionalString(value, { max = 2000 } = {}) {
  if (value === undefined || value === null) return '';
  const text = String(value).trim();
  return text.slice(0, max);
}

function requireEmail(value) {
  const email = requireString(value, 'Email').toLowerCase();
  if (!EMAIL_PATTERN.test(email)) throw ApiError.badRequest('Please enter a valid email address.');
  return email;
}

function requirePassword(value) {
  const password = typeof value === 'string' ? value : '';
  if (password.length < 6) {
    throw ApiError.badRequest('Password must be at least 6 characters long.');
  }
  return password;
}

function requirePositiveNumber(value, field) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    throw ApiError.badRequest(`${field} must be a number greater than 0.`);
  }
  return number;
}

function requireId(value, field = 'id') {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw ApiError.badRequest(`Invalid ${field}.`);
  return id;
}

function requireOneOf(value, allowed, field) {
  if (!allowed.includes(value)) {
    throw ApiError.badRequest(`${field} must be one of: ${allowed.join(', ')}.`);
  }
  return value;
}

/** Accepts an array of image URLs (or data paths) and drops empty entries. */
function normalizeImages(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((image) => (typeof image === 'string' ? image.trim() : ''))
    .filter(Boolean)
    .slice(0, 8);
}

module.exports = {
  requireString,
  optionalString,
  requireEmail,
  requirePassword,
  requirePositiveNumber,
  requireId,
  requireOneOf,
  normalizeImages,
};
