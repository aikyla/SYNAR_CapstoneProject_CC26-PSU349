/**
 * Standardized API response helpers.
 * Matches the SYNAR API Contract format:
 *   Success → { status: "success", data: { ... } }
 *   Error   → { status: "error", message: "..." }
 */

const sendSuccess = (res, { data = null, statusCode = 200 } = {}) => {
  const response = { status: "success" };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

const sendError = (res, { message = "Something went wrong", statusCode = 500 } = {}) => {
  return res.status(statusCode).json({
    status: "error",
    message,
  });
};

module.exports = { sendSuccess, sendError };
