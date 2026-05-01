const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const usersCollection = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/responseHelper");
const { isValidEmail, isValidPassword, MIN_PASSWORD_LENGTH } = require("../utils/validators");

/**
 * POST /api/auth/register
 * Register a new user with email and password.
 */
exports.register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  if (!isValidEmail(email)) {
    throw new AppError("Invalid email format", 400);
  }

  if (!isValidPassword(password)) {
    throw new AppError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400);
  }

  // Check if user already exists
  const snapshot = await usersCollection.where("email", "==", email.trim().toLowerCase()).get();

  if (!snapshot.empty) {
    throw new AppError("Email is already registered", 409);
  }

  // Hash password and save to Firestore
  const hashedPassword = await bcrypt.hash(password, 10);

  const docRef = await usersCollection.add({
    email: email.trim().toLowerCase(),
    password: hashedPassword,
    createdAt: new Date(),
  });

  sendSuccess(res, {
    data: { userId: docRef.id, email: email.trim().toLowerCase() },
    statusCode: 201,
  });
});

/**
 * POST /api/auth/login
 * Authenticate a user and return a JWT token.
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  // Find user by email
  const snapshot = await usersCollection.where("email", "==", email.trim().toLowerCase()).get();

  if (snapshot.empty) {
    throw new AppError("Invalid email or password", 401);
  }

  const userDoc = snapshot.docs[0];
  const user = userDoc.data();

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  // Generate JWT token with userId included
  const token = jwt.sign(
    { userId: userDoc.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  sendSuccess(res, {
    data: { token, userId: userDoc.id, email: user.email },
  });
});