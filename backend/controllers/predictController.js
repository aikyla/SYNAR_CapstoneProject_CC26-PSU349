const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/responseHelper");

exports.predict = asyncHandler(async (req, res) => {
  const { image_base64, weather } = req.body;
  const aiServiceUrl = process.env.AI_SERVICE_URL;

  if (!aiServiceUrl) {
    throw new AppError("AI_SERVICE_URL belum dikonfigurasi di environment backend", 500);
  }

  if (!image_base64) {
    throw new AppError("Field 'image_base64' wajib diisi", 400);
  }

  if (!weather) {
    throw new AppError("Field 'weather' wajib diisi", 400);
  }

  const mlPayload = {
    image_base64,
    temp: weather.temperature ?? weather.temp,
    humidity: weather.humidity,
    wind: weather.wind_speed ?? weather.wind,
    cloud: weather.cloud_cover ?? weather.cloud,
    uv_index: weather.uv_index,
  };

  const response = await fetch(aiServiceUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mlPayload),
  });

  const aiResult = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      aiResult?.message || aiResult?.error || `AI service mengembalikan status ${response.status}`;
    throw new AppError(message, response.status);
  }

  const result = aiResult.data || aiResult;

  sendSuccess(res, {
    data: {
      skin_type: result.skin_type,
      skin_class: result.skin_class,
      confidence: result.confidence ?? result.skin_confidence,
      uv_index: result.uv ?? result.uv_index ?? mlPayload.uv_index,
      risk_level: result.risk ?? result.risk_level,
      safe_time: result.safe_time,
      duration_minutes: result.duration_minutes ?? result.safe_time,
      source: "ml-service",
      note: result.note,
    },
  });
});
