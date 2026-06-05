const express = require("express");
const router = express.Router();

const { predict, predictBestTime, predictManualCorrection } = require("../controllers/predictController");

// POST /api/predict - Kirim prediksi ke AI service (klasifikasi tipe kulit + durasi aman AI)
router.post("/", predict);

// POST /api/predict/best-time - Dapatkan jam rekomendasi beraktivitas terbaik dari AI Regresi
router.post("/best-time", predictBestTime);

// POST /api/predict/correction - Hitung koreksi cuaca untuk tipe kulit manual (tanpa kamera)
router.post("/correction", predictManualCorrection);

module.exports = router;
