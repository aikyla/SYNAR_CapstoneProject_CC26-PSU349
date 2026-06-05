require("dotenv").config();

const requiredEnvVars = ["JWT_SECRET", "FIREBASE_SERVICE_ACCOUNT"];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.error(`Environment variable '${key}' tidak ditemukan.`);
    console.error("Pastikan file .env sudah dikonfigurasi dengan benar.");
    process.exit(1);
  }
}

const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
