const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHelper");

/**
 * GET /api/weather/realtime
 *
 * Mengambil data cuaca realtime dari Open-Meteo API.
 * Jika parameter lat & lon tidak dikirim, kembalikan data dummy.
 *
 * Query params (opsional):
 *   - lat: Latitude lokasi (-90 s/d 90)
 *   - lon: Longitude lokasi (-180 s/d 180)
 */

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

exports.getRealtime = asyncHandler(async (req, res) => {
  const { lat, lon } = req.query;

  // Jika tidak ada lat/lon, kembalikan data dummy
  if (!lat || !lon) {
    return sendSuccess(res, {
      data: {
        temperature: 30,
        humidity: 70,
        uv_index: 6.5,
        cloud_cover: 25,
        wind_speed: 10,
        source: "dummy",
      },
    });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    const AppError = require("../utils/AppError");
    throw new AppError("'lat' dan 'lon' harus berupa angka yang valid", 400);
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    const AppError = require("../utils/AppError");
    throw new AppError(
      "'lat' harus antara -90 dan 90, 'lon' antara -180 dan 180",
      400
    );
  }

  // Fetch data dari Open-Meteo API
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current:
      "temperature_2m,relative_humidity_2m,cloud_cover,wind_speed_10m,uv_index",
    timezone: "auto",
  });

  const response = await fetch(`${OPEN_METEO_URL}?${params}`);

  if (!response.ok) {
    const AppError = require("../utils/AppError");
    throw new AppError(
      "Gagal mengambil data cuaca dari external API",
      502
    );
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
      source: "open-meteo",
    },
  });
});
