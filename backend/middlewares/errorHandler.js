const { sendError } = require("../utils/responseHelper");

/**
 * Middleware: 404 Not Found Handler.
 * Menangkap semua request yang tidak cocok dengan route manapun.
 */
const notFoundHandler = (req, res) => {
  sendError(res, {
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`,
    statusCode: 404,
  });
};

/**
 * Middleware: Global Error Handler.
 * Menangkap semua error yang dilempar dari controller/middleware.
 *
 * Format response error:
 * {
 *   "error": true,
 *   "message": "Terjadi kesalahan"
 * }
 */
// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, next) => {
  // Log error ke console (stack trace hanya di development)
  console.error(`[ERROR] ${err.message}`);

  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : "Terjadi kesalahan pada server";

  sendError(res, { message, statusCode });
};

module.exports = { notFoundHandler, globalErrorHandler };
