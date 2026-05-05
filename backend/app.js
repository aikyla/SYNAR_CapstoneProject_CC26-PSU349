const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { notFoundHandler, globalErrorHandler } = require("./middlewares/errorHandler");

// --- Import Routes ---
const authRoutes = require("./routes/authRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const predictRoutes = require("./routes/predictRoutes");
const historyRoutes = require("./routes/historyRoutes");

/**
 * Inisialisasi Express application.
 * File ini hanya berisi konfigurasi app (middleware, routes, error handler).
 * Server startup dilakukan di server.js.
 */
const app = express();

// --- Global Middleware ---
app.use(helmet()); // Security headers
app.use(cors()); // Cross-Origin Resource Sharing
app.use(express.json({ limit: "10mb" })); // JSON body parser (limit 10MB untuk base64 image)

// --- Health Check ---
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/predict", predictRoutes);
app.use("/api/history", historyRoutes);

// --- Error Handling ---
app.use(notFoundHandler); // 404 handler (harus setelah semua routes)
app.use(globalErrorHandler); // Global error handler (harus paling terakhir)

module.exports = app;
