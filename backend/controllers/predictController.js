const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/responseHelper");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

/**
 * POST /predict
 * Proxies prediction request to the AI team's FastAPI service.
 * Forwards the request body as-is and returns the AI response.
 */
exports.predict = asyncHandler(async (req, res) => {
  if (!AI_SERVICE_URL) {
    throw new AppError("AI service URL is not configured", 503);
  }

  const response = await fetch(AI_SERVICE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData?.message || `AI service returned status ${response.status}`;
    throw new AppError(message, response.status);
  }

  const aiResult = await response.json();

  sendSuccess(res, { data: aiResult.data || aiResult });
});
