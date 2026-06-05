import { apiRequest } from "../core/api";

export async function searchLocations(query) {
  if (query.trim().length < 2) return [];

  return apiRequest(`/weather/geocode/search?q=${encodeURIComponent(query.trim())}`);
}

export async function reverseGeocode({ latitude, longitude }) {
  const payload = await apiRequest(
    `/weather/geocode/reverse?lat=${latitude}&lon=${longitude}`
  );

  return payload.displayName || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
}

export async function fetchWeather(coords) {
  return apiRequest(`/weather/realtime?lat=${coords.latitude}&lon=${coords.longitude}`);
}

export async function saveHistory(payload) {
  return apiRequest("/history", {
    method: "POST",
    body: JSON.stringify({
      skin_type: payload.skin_type,
      uv_index: payload.uv_index,
      temperature: payload.weather.temp,
      humidity: payload.weather.humidity,
      cloud_cover: payload.weather.cloud,
      wind_speed: payload.weather.wind,
      recommended_duration: payload.recommended_duration,
      risk_level: payload.risk_level,
      recommendation: payload.recommendation,
      location: payload.location,
      latitude: payload.coords.latitude,
      longitude: payload.coords.longitude,
    }),
  });
}

export async function predictSkinType(imageBase64, weather) {
  return apiRequest("/predict", {
    method: "POST",
    body: JSON.stringify({
      image_base64: imageBase64,
      weather,
    }),
  });
}

export async function fetchHistory(userId) {
  return apiRequest(`/history/${userId}`);
}

export async function deleteHistory(historyId) {
  return apiRequest(`/history/${historyId}`, {
    method: "DELETE",
  });
}

// Tambahan API untuk Koreksi Cuaca Tanpa Kamera (Manual Mode)
export async function predictManualCorrection(skinType, weather) {
  return apiRequest("/predict/correction", {
    method: "POST",
    body: JSON.stringify({
      skin_type: skinType,
      weather,
    }),
  });
}

// Tambahan API untuk Mendapatkan Jam Aktivitas Terbaik (Best Time) dari AI Regresi
export async function predictBestTime(bulan, lat, lon) {
  return apiRequest("/predict/best-time", {
    method: "POST",
    body: JSON.stringify({
      bulan,
      lat,
      lon,
    }),
  });
}
