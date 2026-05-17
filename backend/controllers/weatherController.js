const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/responseHelper");

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org";

const validateCoordinates = (lat, lon) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new AppError("'lat' dan 'lon' harus berupa angka yang valid", 400);
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new AppError(
      "'lat' harus antara -90 dan 90, 'lon' antara -180 dan 180",
      400
    );
  }

  return { latitude, longitude };
};

const nominatimHeaders = {
  "Accept-Language": "id,en",
  "User-Agent": "SYNAR/1.0 capstone-app",
};

exports.getRealtime = asyncHandler(async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return sendSuccess(res, {
      data: {
        temperature: 30,
        humidity: 70,
        uv_index: 6.5,
        cloud_cover: 25,
        wind_speed: 10,
        source: "default",
      },
    });
  }

  const { latitude, longitude } = validateCoordinates(lat, lon);

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current:
      "temperature_2m,relative_humidity_2m,cloud_cover,wind_speed_10m,uv_index",
    timezone: "auto",
  });

  const response = await fetch(`${OPEN_METEO_URL}?${params}`);

  if (!response.ok) {
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
      current_time: current.time,
      timezone: weatherData.timezone,
      timezone_abbreviation: weatherData.timezone_abbreviation,
      utc_offset_seconds: weatherData.utc_offset_seconds,
      fetched_at: new Date().toISOString(),
      source: "open-meteo",
    },
  });
});

exports.searchLocation = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || String(q).trim().length < 2) {
    return sendSuccess(res, { data: [] });
  }

  const params = new URLSearchParams({
    q: String(q).trim(),
    limit: "6",
    format: "json",
    addressdetails: "1",
  });

  const response = await fetch(`${NOMINATIM_URL}/search?${params}`, {
    headers: nominatimHeaders,
  });

  if (!response.ok) {
    throw new AppError("Gagal mencari lokasi dari OpenStreetMap", 502);
  }

  const payload = await response.json();
  const results = payload.map((item) => ({
    id: item.place_id,
    name:
      item.address?.road ||
      item.address?.pedestrian ||
      item.address?.footway ||
      item.address?.suburb ||
      item.address?.village ||
      item.address?.city_district ||
      item.address?.district ||
      item.address?.municipality ||
      item.address?.town ||
      item.address?.city ||
      item.name ||
      item.display_name?.split(",")[0] ||
      "Unknown place",
    country: item.address?.country,
    admin1: item.address?.state || item.address?.county || item.address?.city,
    displayName: item.display_name,
    latitude: Number(item.lat),
    longitude: Number(item.lon),
  }));

  sendSuccess(res, { data: results });
});

exports.reverseLocation = asyncHandler(async (req, res) => {
  const { lat, lon } = req.query;
  const { latitude, longitude } = validateCoordinates(lat, lon);

  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    format: "json",
    addressdetails: "1",
  });

  const response = await fetch(`${NOMINATIM_URL}/reverse?${params}`, {
    headers: nominatimHeaders,
  });

  if (!response.ok) {
    throw new AppError("Gagal membaca lokasi dari OpenStreetMap", 502);
  }

  const payload = await response.json();
  const address = payload.address || {};
  const place =
    address.road ||
    address.pedestrian ||
    address.footway ||
    address.suburb ||
    address.village ||
    address.city_district ||
    address.district ||
    address.municipality ||
    address.town ||
    address.city ||
    address.county;
  const parent =
    address.city_district ||
    address.district ||
    address.city ||
    address.town ||
    address.county ||
    address.state;
  const displayName =
    [place, parent !== place ? parent : null, address.country].filter(Boolean).join(", ") ||
    payload.display_name ||
    `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;

  sendSuccess(res, {
    data: {
      displayName,
      latitude,
      longitude,
      address,
    },
  });
});
