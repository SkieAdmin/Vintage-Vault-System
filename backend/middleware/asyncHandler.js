/**
 * Wraps a controller so a thrown error is passed to the error middleware
 * instead of crashing the request. Keeps controllers free of try/catch noise.
 */
module.exports = function asyncHandler(handler) {
  return (req, res, next) => {
    try {
      const result = handler(req, res, next);
      if (result && typeof result.catch === 'function') result.catch(next);
    } catch (error) {
      next(error);
    }
  };
};
