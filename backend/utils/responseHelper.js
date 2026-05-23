const sendSuccess = (res, { data, statusCode = 200 }) => {
  return res.status(statusCode).json({
    error: false,
    data,
  });
};

const sendError = (res, { message, statusCode = 500 }) => {
  return res.status(statusCode).json({
    error: true,
    message,
  });
};

module.exports = { sendSuccess, sendError };
