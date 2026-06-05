const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

/**
 * Middleware to verify JWT token from Authorization header.
 * Expects: Authorization: Bearer <token>
 * Attaches decoded payload to req.user on success.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Access denied. No token provided", 401);
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new AppError("Access denied. Malformed authorization header", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    throw new AppError("Invalid or expired token", 401);
  }
};

module.exports = authMiddleware;