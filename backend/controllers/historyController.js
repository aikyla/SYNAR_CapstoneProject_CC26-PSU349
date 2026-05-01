const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/responseHelper");
const historyCollection = require("../models/History");

/**
 * POST /history
 * Saves a prediction result to the user's history.
 * Requires authentication.
 */
exports.createHistory = asyncHandler(async (req, res) => {
  const { skin_type, uv_index, temperature, humidity, cloud_cover, wind_speed, recommended_duration, risk_level, recommendation } = req.body;

  if (!skin_type || uv_index === undefined) {
    throw new AppError("'skin_type' and 'uv_index' are required", 400);
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
    createdAt: new Date(),
  };

  const docRef = await historyCollection.add(historyData);

  sendSuccess(res, {
    data: { historyId: docRef.id, ...historyData },
    statusCode: 201,
  });
});

/**
 * GET /history/:userId
 * Retrieves prediction history for a specific user.
 * Requires authentication.
 */
exports.getHistoryByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Users can only access their own history
  if (req.user.userId !== userId) {
    throw new AppError("You can only access your own history", 403);
  }

  const snapshot = await historyCollection
    .where("userId", "==", userId)
    .get();

  const history = snapshot.docs
    .map((doc) => ({
      historyId: doc.id,
      ...doc.data(),
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  sendSuccess(res, { data: history });
});
