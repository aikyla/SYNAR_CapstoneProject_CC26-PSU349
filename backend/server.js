const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const { sendError } = require("./utils/responseHelper");
const AppError = require("./utils/AppError");

// --- Validate required environment variables ---
const requiredEnv = ["JWT_SECRET", "FIREBASE_SERVICE_ACCOUNT"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const app = express();

// --- Global Middleware ---
app.use(helmet());
app.use(cors());
app.use(express.json());

// --- Routes ---
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const predictRoutes = require("./routes/predictRoutes");
const historyRoutes = require("./routes/historyRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/weather", weatherRoutes);
app.use("/predict", predictRoutes);
app.use("/history", historyRoutes);

// --- Health Check ---
app.get("/api/health", (req, res) => {
  res.json({ status: "success", data: { timestamp: new Date().toISOString() } });
});

// --- 404 Handler ---
app.use((req, res) => {
  sendError(res, { message: `Route ${req.method} ${req.originalUrl} not found`, statusCode: 404 });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal Server Error";

  sendError(res, { message, statusCode });
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});