/**
 * Server Entry Point
 *
 * File ini bertanggung jawab untuk:
 * 1. Memuat environment variables dari .env
 * 2. Menginisialisasi Firebase Admin SDK
 * 3. Menjalankan Express server
 *
 * Jalankan dengan: npm run dev (development) atau npm start (production)
 */

// Load environment variables SEBELUM import apapun yang butuh env vars
require("dotenv").config();

// Validasi environment variables yang wajib ada
const requiredEnvVars = ["JWT_SECRET", "FIREBASE_SERVICE_ACCOUNT"];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.error(`❌ Environment variable '${key}' tidak ditemukan.`);
    console.error("   Pastikan file .env sudah dikonfigurasi dengan benar.");
    process.exit(1);
  }
}

// Import app setelah env vars tervalidasi
// (firebase.js akan diinisialisasi saat di-require oleh models/controllers)
const app = require("./app");

// --- Start Server ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server berjalan di port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});