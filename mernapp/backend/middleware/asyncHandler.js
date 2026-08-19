/**
 * Wraps an async route handler so a rejected promise reaches Express' error
 * handler instead of hanging the request. Express 4 does not await handlers.
 */
const asyncHandler = (handler) => (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);

module.exports = asyncHandler;
