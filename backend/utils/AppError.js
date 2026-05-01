/**
 * Custom error class for operational errors.
 * Extends the native Error class with an HTTP status code,
 * allowing the global error handler to respond appropriately.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
