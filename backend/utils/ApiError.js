/**
 * Small error class so controllers can throw a message + HTTP status,
 * and one middleware turns it into a JSON response.
 */
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }

  static badRequest(message) {
    return new ApiError(400, message);
  }

  static unauthorized(message = 'You need to log in first.') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'You are not allowed to do that.') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Not found.') {
    return new ApiError(404, message);
  }

  /** 409 = the request clashed with the current state (e.g. item already reserved). */
  static conflict(message) {
    return new ApiError(409, message);
  }
}

module.exports = ApiError;
