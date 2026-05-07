const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/responseHelper");
const { saveHistory, getHistoryByUser } = require("../models/historyModel");

/**
 * POST /api/history
 *
 * Menyimpan hasil prediksi ke history pengguna di Firestore.
 * Membutuhkan autentikasi (JWT).
 *
 * Request body:
 * {
 *   "skin_type": 3,
 *   "uv_index": 7.2,
 *   "temperature": 31,
 *   "humidity": 80,
 *   "cloud_cover": 25,
 *   "wind_speed": 12,
 *   "recommended_duration": 25,
 *   "risk_level": "moderate",
 *   "recommendation": "Gunakan sunscreen SPF 30+"
 * }
 */
exports.createHistory = asyncHandler(async (req, res) => {
  const {
    skin_type,
    uv_index,
    temperature,
    humidity,
    cloud_cover,
    wind_speed,
    recommended_duration,
    risk_level,
    recommendation,
  } = req.body;

  // Validasi field wajib
  if (!skin_type || uv_index === undefined) {
    throw new AppError("'skin_type' dan 'uv_index' wajib diisi", 400);
  }

  const historyData = {
    userId: req.user.userId,
    skin_type,
    uv_index,
    temperature: temperature || null,
    humidity: humidity || null,
    cloud_cover: cloud_cover || null,
    wind_speed: wind_speed || null,
    recommended_duration: recommended_duration || null,
    risk_level: risk_level || null,
    recommendation: recommendation || null,
  };

  const result = await saveHistory(historyData);

  sendSuccess(res, {
    data: result,
    statusCode: 201,
  });
});

/**
 * GET /api/history/:userId
 *
 * Mengambil riwayat prediksi berdasarkan userId dari Firestore.
 * Membutuhkan autentikasi (JWT).
 * User hanya bisa mengakses history miliknya sendiri.
 */
exports.getHistoryByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // User hanya bisa akses history miliknya sendiri
  if (req.user.userId !== userId) {
    throw new AppError("Anda hanya bisa mengakses history milik sendiri", 403);
  }

  const history = await getHistoryByUser(userId);

  sendSuccess(res, { data: history });
});
