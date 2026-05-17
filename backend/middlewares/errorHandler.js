const { sendError } = require("../utils/responseHelper");

const notFoundHandler = (req, res) => {
  sendError(res, {
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`,
    statusCode: 404,
  });
};

const globalErrorHandler = (err, req, res, _next) => {
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
