const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/responseHelper");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

/**
 * POST /api/predict
 *
 * Proxy request prediksi ke AI service (FastAPI).
 * Jika AI_SERVICE_URL belum dikonfigurasi, kembalikan response dummy.
 *
 * Request body:
 * {
 *   "image_base64": "...",
 *   "weather": {
 *     "uv_index": 7.2,
 *     "temperature": 31,
 *     "humidity": 80,
 *     "wind_speed": 12,
 *     "uva": 4.1,
 *     "uvb": 0.9
 *   }
 * }
 */
exports.predict = asyncHandler(async (req, res) => {
  const { image_base64, weather } = req.body;

  // Validasi input dasar
  if (!image_base64) {
    throw new AppError("Field 'image_base64' wajib diisi", 400);
  }

  // Jika AI service belum tersedia, kembalikan dummy response
  if (!AI_SERVICE_URL) {
    console.warn(
      "⚠️  AI_SERVICE_URL belum dikonfigurasi. Mengembalikan response dummy."
    );

    return sendSuccess(res, {
      data: {
        skin_type: 3,
        confidence: 0.85,
        safe: true,
        duration_minutes: 25,
        source: "dummy",
      },
    });
  }

  // Forward request ke AI service
  const response = await fetch(AI_SERVICE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message =
      errorData?.message || `AI service mengembalikan status ${response.status}`;
    throw new AppError(message, response.status);
  }

  const aiResult = await response.json();

  sendSuccess(res, {
    data: aiResult.data || aiResult,
  });
});
