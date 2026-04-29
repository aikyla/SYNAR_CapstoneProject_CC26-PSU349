const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/responseHelper");

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

/**
 * GET /weather/realtime?lat=&lon=
 * Fetches real-time weather data including UV index.
 * Uses Open-Meteo API (free, no API key required).
 */
exports.getRealtime = asyncHandler(async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    throw new AppError("Query parameters 'lat' and 'lon' are required", 400);
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new AppError("'lat' and 'lon' must be valid numbers", 400);
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new AppError("'lat' must be between -90 and 90, 'lon' between -180 and 180", 400);
  }

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: "temperature_2m,relative_humidity_2m,cloud_cover,wind_speed_10m,uv_index",
    timezone: "auto",
  });

  const response = await fetch(`${OPEN_METEO_URL}?${params}`);

  if (!response.ok) {
    throw new AppError("Failed to fetch weather data from external API", 502);
  }

  const weatherData = await response.json();
  const current = weatherData.current;

  sendSuccess(res, {
    data: {
      uv_index: current.uv_index,
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      cloud_cover: current.cloud_cover,
      wind_speed: current.wind_speed_10m,
    },
  });
});
