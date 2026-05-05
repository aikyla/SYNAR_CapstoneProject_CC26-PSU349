/**
 * Helper functions untuk standarisasi format response API.
 * Semua response mengikuti format konsisten:
 *
 * Success: { error: false, data: { ... } }
 * Error:   { error: true, message: "..." }
 */

/**
 * Kirim response sukses.
 * @param {object} res - Express response object
 * @param {object} options
 * @param {*} options.data - Data yang akan dikirim
 * @param {number} [options.statusCode=200] - HTTP status code
 */
const sendSuccess = (res, { data, statusCode = 200 }) => {
  return res.status(statusCode).json({
    error: false,
    data,
  });
};

/**
 * Kirim response error.
 * @param {object} res - Express response object
 * @param {object} options
 * @param {string} options.message - Pesan error
 * @param {number} [options.statusCode=500] - HTTP status code
 */
const sendError = (res, { message, statusCode = 500 }) => {
  return res.status(statusCode).json({
    error: true,
    message,
  });
};

module.exports = { sendSuccess, sendError };
