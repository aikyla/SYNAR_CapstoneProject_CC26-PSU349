const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/responseHelper");
const { isValidEmail, isValidPassword, MIN_PASSWORD_LENGTH } = require("../utils/validators");
const { findByEmail, createUser } = require("../models/userModel");

/**
 * POST /api/auth/register
 *
 * Mendaftarkan user baru dengan email dan password.
 * Password di-hash menggunakan bcrypt sebelum disimpan.
 */
exports.register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validasi input
  if (!email || !password) {
    throw new AppError("Email dan password wajib diisi", 400);
  }

  if (!isValidEmail(email)) {
    throw new AppError("Format email tidak valid", 400);
  }

  if (!isValidPassword(password)) {
    throw new AppError(
      `Password minimal ${MIN_PASSWORD_LENGTH} karakter`,
      400
    );
  }

  // Cek apakah email sudah terdaftar
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await findByEmail(normalizedEmail);

  if (existingUser) {
    throw new AppError("Email sudah terdaftar", 409);
  }

  // Hash password dan simpan ke Firestore
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await createUser({
    email: normalizedEmail,
    password: hashedPassword,
  });

  sendSuccess(res, {
    data: newUser,
    statusCode: 201,
  });
});

/**
 * POST /api/auth/login
 *
 * Autentikasi user dan kembalikan JWT token.
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validasi input
  if (!email || !password) {
    throw new AppError("Email dan password wajib diisi", 400);
  }

  // Cari user berdasarkan email
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findByEmail(normalizedEmail);

  if (!user) {
    throw new AppError("Email atau password salah", 401);
  }

  // Verifikasi password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Email atau password salah", 401);
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user.userId, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  sendSuccess(res, {
    data: {
      token,
      userId: user.userId,
      email: user.email,
    },
  });
});