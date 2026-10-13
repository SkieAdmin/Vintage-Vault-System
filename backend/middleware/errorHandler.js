/** Turns thrown errors into a consistent JSON response, and handles 404s. */
const ApiError = require('../utils/ApiError');

function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} does not exist.`));
}

// eslint-disable-next-line no-unused-vars -- Express needs all four arguments.
function errorHandler(err, req, res, next) {
  const status = err.status || 500;

  if (status >= 500) {
    console.error('[error]', err);
  }

  res.status(status).json({
    success: false,
    message: status >= 500 ? 'Something went wrong on the server.' : err.message,
  });
}

module.exports = { notFoundHandler, errorHandler };
