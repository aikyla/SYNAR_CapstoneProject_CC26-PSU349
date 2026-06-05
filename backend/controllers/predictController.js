const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/responseHelper");

// Konstanta MED berdasarkan tipe kulit Fitzpatrick 1–6 (dalam J/m2)
const MED_LOWER = {
  1: 200,
  2: 250,
  3: 300,
  4: 450,
  5: 600,
  6: 1000
};

// Klasifikasi tingkat risiko berdasarkan indeks UV
function getRiskLevel(uvi) {
  if (uvi <= 2) return "Low";
  if (uvi <= 5) return "Moderate";
  if (uvi <= 7) return "High";
  return "Extreme";
}

// Rekomendasi proteksi/SPF adaptif
function generateSpfTips(uvi, skinType) {
  const spfMin = (skinType === 5 || skinType === 6) ? 15 : 30;
  let spf = spfMin;
  
  if (uvi >= 8) {
    spf = Math.max(spfMin, 50);
  } else if (uvi >= 3) {
    spf = Math.max(spfMin, 30);
  }
  
  return `Aman untuk keluar. Gunakan sunscreen minimal SPF ${spf} PA++++.`;
}

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

  // 1. Ekstrak data base64 gambar
  let base64Data = image_base64;
  let contentType = "image/jpeg";

  if (image_base64.includes(";base64,")) {
    const parts = image_base64.split(";base64,");
    contentType = parts[0].split(":")[1] || "image/jpeg";
    base64Data = parts[1];
  }

  const buffer = Buffer.from(base64Data, "base64");
  
  // Konversi buffer ke Blob standar Node.js untuk FormData multipart
  const fileBlob = new Blob([buffer], { type: contentType });
  
  const formData = new FormData();
  formData.append("file", fileBlob, "face_capture.jpg");

  // Pastikan URL tujuan mengarah ke endpoint '/predict' FastAPI
  let targetUrl = aiServiceUrl;
  if (!targetUrl.endsWith("/predict") && !targetUrl.endsWith("/predict/")) {
    targetUrl = targetUrl.replace(/\/$/, "") + "/predict";
  }

  // 2. Hubungi AI Service (CNN) untuk mendeteksi tipe kulit secara aman lewat backend
  const response = await fetch(targetUrl, {
    method: "POST",
    body: formData,
  });

  const aiResult = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      aiResult?.message || aiResult?.detail || aiResult?.error || `AI service mengembalikan status ${response.status}`;
    throw new AppError(message, response.status);
  }

  // Ambil label hasil klasifikasi CNN (FastAPI pred_label adalah 0-5)
  const pred_label = aiResult.pred_label;
  if (pred_label === undefined) {
    throw new AppError("Respon model AI CNN tidak valid atau pred_label kosong", 500);
  }

  const skin_type = Math.min(6, Math.max(1, pred_label + 1));
  const confidence = aiResult.confidence ?? 1.0;

  // 3. Kalkulasi sistem MED (Durasi Aman) Menggunakan Model Regresi AI (Port 8001)
  const uv_index = Math.round(weather.uv_index ?? weather.uvi ?? 0);
  const t2m = weather.temperature_2m ?? weather.temperature ?? weather.t2m ?? 30.0;
  const rh2m = weather.relative_humidity_2m ?? weather.humidity ?? weather.rh2m ?? 70.0;
  const ws2m = weather.wind_speed_10m ?? weather.wind_speed ?? weather.ws2m ?? 2.0;
  const hr = weather.hr ?? new Date().getHours();
  const bulan = weather.bulan ?? (new Date().getMonth() + 1);

  const regressionServiceUrl = process.env.REGRESSION_SERVICE_URL || "http://localhost:8001";
  
  let duration_minutes = 120.0;
  let safe_time = "> 120 mins";
  let note = generateSpfTips(uv_index, skin_type);
  let calculation_source = "backend-fallback";

  try {
    const regressionRes = await fetch(`${regressionServiceUrl}/predict/correction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uvi: uv_index,
        skin_type: skin_type,
        t2m: t2m,
        rh2m: rh2m,
        ws2m: ws2m,
        hr: hr,
        bulan: bulan
      })
    });

    if (regressionRes.ok) {
      const regResult = await regressionRes.json();
      duration_minutes = regResult.durasi_aman_menit ?? duration_minutes;
      safe_time = regResult.durasi_display ?? safe_time;
      note = regResult.tips ?? note;
      calculation_source = "ai-regression-model";
    } else {
      // Fallback manual jika server 8001 memberikan response error
      if (uv_index > 0) {
        duration_minutes = MED_LOWER[skin_type] / (uv_index * 1.5);
      }
      duration_minutes = Math.min(Math.min(duration_minutes, 120.0), 120.0);
      duration_minutes = Math.round(duration_minutes * 10) / 10;
      safe_time = duration_minutes >= 120 ? "> 120 mins" : (duration_minutes < 10 ? "< 10 mins" : `${duration_minutes} mins`);
    }
  } catch (error) {
    // Fallback manual jika server 8001 mati/tidak merespon
    console.error("Gagal menghubungi AI Regression Service (Port 8001), menggunakan fallback manual:", error.message);
    if (uv_index > 0) {
      duration_minutes = MED_LOWER[skin_type] / (uv_index * 1.5);
    }
    duration_minutes = Math.min(duration_minutes, 120.0);
    duration_minutes = Math.round(duration_minutes * 10) / 10;
    safe_time = duration_minutes >= 120 ? "> 120 mins" : (duration_minutes < 10 ? "< 10 mins" : `${duration_minutes} mins`);
  }

  const risk_level = getRiskLevel(uv_index);

  // 4. Kirim respon lengkap terpadu ke Frontend
  sendSuccess(res, {
    data: {
      skin_type: skin_type,
      skin_class: `Type ${skin_type}`,
      confidence: confidence,
      uv_index: uv_index,
      risk_level: risk_level,
      safe_time: safe_time,
      duration_minutes: duration_minutes,
      source: "backend-orchestrator",
      calculation_source: calculation_source,
      note: note,
    },
  });
});

// Endpoint baru untuk mendapatkan Waktu Terbaik beraktivitas (Best Time) lewat Backend
exports.predictBestTime = asyncHandler(async (req, res) => {
  const { lat, lon, bulan } = req.body;
  const regressionServiceUrl = process.env.REGRESSION_SERVICE_URL || "http://localhost:8001";

  if (!lat || !lon) {
    throw new AppError("Coordinate 'lat' dan 'lon' wajib diisi", 400);
  }

  const currentBulan = bulan || (new Date().getMonth() + 1);

  try {
    // 1. Ambil ramalan cuaca per jam (24 jam) dari Open-Meteo
    const openMeteoRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto&forecast_days=1`
    );

    if (!openMeteoRes.ok) {
      throw new AppError("Gagal mengambil data prakiraan cuaca per jam dari external API", 502);
    }

    const weatherData = await openMeteoRes.json();
    const hourly = weatherData.hourly;

    if (!hourly || !hourly.temperature_2m) {
      throw new AppError("Data prakiraan cuaca tidak lengkap", 502);
    }

    // 2. Format menjadi per jam (hanya jam aktif luar ruangan: 6 AM - 4 PM / 06:00 - 16:00)
    const t2m_per_jam = {};
    const rh2m_per_jam = {};
    const ws_per_jam = {}; // Wait, let's keep ws2m_per_jam variable name from target
    const ws2m_per_jam = {};

    for (let i = 6; i <= 16; i++) {
      t2m_per_jam[i] = hourly.temperature_2m[i];
      rh2m_per_jam[i] = hourly.relative_humidity_2m[i];
      ws2m_per_jam[i] = hourly.wind_speed_10m[i];
    }

    // 3. Hubungi AI Regression Service
    const response = await fetch(`${regressionServiceUrl}/predict/best-time`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bulan: currentBulan,
        t2m_per_jam,
        rh2m_per_jam,
        ws2m_per_jam
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new AppError(result?.message || "Gagal memanggil model AI Best Time", response.status);
    }

    sendSuccess(res, {
      data: result
    });

  } catch (error) {
    throw new AppError(`Gagal menghubungi server AI Best Time: ${error.message}`, 500);
  }
});

// Endpoint untuk menghitung koreksi waktu aman berdasarkan tipe kulit manual & cuaca (tanpa kamera)
exports.predictManualCorrection = asyncHandler(async (req, res) => {
  const { skin_type, weather } = req.body;
  const regressionServiceUrl = process.env.REGRESSION_SERVICE_URL || "http://localhost:8001";

  if (!skin_type || !weather) {
    throw new AppError("Field 'skin_type' dan 'weather' wajib diisi", 400);
  }

  const uv_index = Math.round(weather.uv_index ?? weather.uvi ?? 0);
  const t2m = weather.temperature_2m ?? weather.temperature ?? weather.t2m ?? 30.0;
  const rh2m = weather.relative_humidity_2m ?? weather.humidity ?? weather.rh2m ?? 70.0;
  const ws2m = weather.wind_speed_10m ?? weather.wind_speed ?? weather.ws2m ?? 2.0;
  const hr = weather.hr ?? new Date().getHours();
  const bulan = weather.bulan ?? (new Date().getMonth() + 1);

  let duration_minutes = 120.0;
  let safe_time = "> 120 mins";
  let calculation_source = "backend-fallback";
  let note = `Aman untuk keluar. Gunakan sunscreen minimal SPF ${skin_type === 5 || skin_type === 6 ? 15 : 30} PA++++.`;

  try {
    const regressionRes = await fetch(`${regressionServiceUrl}/predict/correction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uvi: uv_index,
        skin_type: Number(skin_type),
        t2m,
        rh2m,
        ws2m,
        hr,
        bulan
      })
    });

    if (regressionRes.ok) {
      const regResult = await regressionRes.json();
      duration_minutes = regResult.durasi_aman_menit ?? duration_minutes;
      safe_time = regResult.durasi_display ?? safe_time;
      note = regResult.tips ?? note;
      calculation_source = "ai-regression-model";
    } else {
      // Fallback manual jika server 8001 memberikan response error
      const MED_LOWER = { 1: 200, 2: 250, 3: 300, 4: 450, 5: 600, 6: 1000 };
      if (uv_index > 0) {
        duration_minutes = MED_LOWER[skin_type] / (uv_index * 1.5);
      }
      duration_minutes = Math.min(duration_minutes, 120.0);
      duration_minutes = Math.round(duration_minutes * 10) / 10;
      safe_time = duration_minutes >= 120 ? "> 120 mins" : (duration_minutes < 10 ? "< 10 mins" : `${duration_minutes} mins`);
    }
  } catch (error) {
    // Fallback manual jika server 8001 mati/tidak merespon
    const MED_LOWER = { 1: 200, 2: 250, 3: 300, 4: 450, 5: 600, 6: 1000 };
    if (uv_index > 0) {
      duration_minutes = MED_LOWER[skin_type] / (uv_index * 1.5);
    }
    duration_minutes = Math.min(duration_minutes, 120.0);
    duration_minutes = Math.round(duration_minutes * 10) / 10;
    safe_time = duration_minutes >= 120 ? "> 120 mins" : (duration_minutes < 10 ? "< 10 mins" : `${duration_minutes} mins`);
  }

  sendSuccess(res, {
    data: {
      skin_type: Number(skin_type),
      uv_index: uv_index,
      safe_time: safe_time,
      duration_minutes: duration_minutes,
      calculation_source: calculation_source,
      note: note,
    }
  });
});
