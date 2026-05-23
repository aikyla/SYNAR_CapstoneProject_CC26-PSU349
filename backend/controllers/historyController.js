const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/responseHelper");
const { saveHistory, getHistoryByUser, deleteHistoryById } = require("../models/historyModel");

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
    location,
    latitude,
    longitude,
  } = req.body;

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
    location: location || null,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
  };

  const result = await saveHistory(historyData);

  sendSuccess(res, {
    data: result,
    statusCode: 201,
  });
});

exports.getHistoryByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (req.user.userId !== userId) {
    throw new AppError("Anda hanya bisa mengakses history milik sendiri", 403);
  }

  const history = await getHistoryByUser(userId);

  sendSuccess(res, { data: history });
});

exports.deleteHistory = asyncHandler(async (req, res) => {
  const { historyId } = req.params;

  const result = await deleteHistoryById(historyId, req.user.userId);

  if (result.reason === "not-found") {
    throw new AppError("History tidak ditemukan", 404);
  }

  if (result.reason === "forbidden") {
    throw new AppError("Anda hanya bisa menghapus history milik sendiri", 403);
  }

  sendSuccess(res, { data: result });
});
