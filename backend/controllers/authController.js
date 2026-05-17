const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/responseHelper");
const { isValidEmail, isValidPassword, MIN_PASSWORD_LENGTH } = require("../utils/validators");
const {
  findByEmail,
  createUser,
  findById,
  updateUser,
  savePasswordResetToken,
  findByPasswordResetTokenHash,
  updatePassword,
  deleteUserById,
} = require("../models/userModel");
const { deleteHistoryByUserId } = require("../models/historyModel");
const { getAppUrl, sendPasswordResetEmail } = require("../utils/mailer");

const RESET_TOKEN_TTL_MINUTES = 30;

const hashResetToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

exports.register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

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

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await findByEmail(normalizedEmail);

  if (existingUser) {
    throw new AppError("Email sudah terdaftar", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await createUser({
    email: normalizedEmail,
    password: hashedPassword,
    name: name?.trim(),
  });

  sendSuccess(res, {
    data: newUser,
    statusCode: 201,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email dan password wajib diisi", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await findByEmail(normalizedEmail);

  if (!user) {
    throw new AppError("Email atau password salah", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Email atau password salah", 401);
  }

  const token = jwt.sign(
    { userId: user.userId, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
  );

  sendSuccess(res, {
    data: {
      token,
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name || user.email.split("@")[0],
        photoUrl: user.photoUrl || null,
        skinType: user.skinType || 3,
      },
    },
  });
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await findById(req.user.userId);

  if (!user) {
    throw new AppError("User tidak ditemukan", 404);
  }

  sendSuccess(res, { data: user });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const { name, photoUrl, skinType } = req.body;
  const updates = {};

  if (name !== undefined) {
    const normalizedName = String(name).trim();
    if (!normalizedName) {
      throw new AppError("Nama tidak boleh kosong", 400);
    }
    updates.name = normalizedName;
  }

  if (photoUrl !== undefined) {
    updates.photoUrl = photoUrl || null;
  }

  if (skinType !== undefined) {
    const parsedSkinType = Number(skinType);
    if (!Number.isInteger(parsedSkinType) || parsedSkinType < 1 || parsedSkinType > 6) {
      throw new AppError("skinType harus angka 1 sampai 6", 400);
    }
    updates.skinType = parsedSkinType;
  }

  const user = await updateUser(req.user.userId, updates);
  sendSuccess(res, { data: user });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    throw new AppError("Format email tidak valid", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await findByEmail(normalizedEmail);
  const defaultMessage = "Jika email terdaftar, link reset password akan dikirim.";

  if (!user) {
    return sendSuccess(res, { data: { message: defaultMessage } });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(resetToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000).toISOString();
  const resetLink = `${getAppUrl()}/reset-password?token=${resetToken}`;

  await savePasswordResetToken({
    userId: user.userId,
    tokenHash,
    expiresAt,
  });

  const mailResult = await sendPasswordResetEmail({
    email: user.email,
    name: user.name,
    resetLink,
  });

  sendSuccess(res, {
    data: {
      message: defaultMessage,
      emailSent: mailResult.sent,
      resetLink: mailResult.sent || process.env.NODE_ENV === "production" ? undefined : resetLink,
    },
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token) {
    throw new AppError("Token reset password wajib diisi", 400);
  }

  if (!isValidPassword(password)) {
    throw new AppError(
      `Password minimal ${MIN_PASSWORD_LENGTH} karakter`,
      400
    );
  }

  const tokenHash = hashResetToken(token);
  const user = await findByPasswordResetTokenHash(tokenHash);

  if (!user || !user.resetPasswordExpiresAt) {
    throw new AppError("Token reset password tidak valid atau sudah kedaluwarsa", 400);
  }

  if (new Date(user.resetPasswordExpiresAt).getTime() < Date.now()) {
    throw new AppError("Token reset password tidak valid atau sudah kedaluwarsa", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await updatePassword(user.userId, hashedPassword);

  sendSuccess(res, {
    data: {
      message: "Password berhasil direset. Silakan login dengan password baru.",
    },
  });
});

exports.deleteMe = asyncHandler(async (req, res) => {
  const user = await findById(req.user.userId);

  if (!user) {
    throw new AppError("User tidak ditemukan", 404);
  }

  const historyResult = await deleteHistoryByUserId(req.user.userId);
  const userResult = await deleteUserById(req.user.userId);

  sendSuccess(res, {
    data: {
      ...userResult,
      deletedHistoryCount: historyResult.deletedCount,
    },
  });
});
