const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { notFoundHandler, globalErrorHandler } = require("./middlewares/errorHandler");
const { sendSuccess } = require("./utils/responseHelper");

const authRoutes = require("./routes/authRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const predictRoutes = require("./routes/predictRoutes");
const historyRoutes = require("./routes/historyRoutes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (req, res) => {
  sendSuccess(res, {
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/predict", predictRoutes);
app.use("/api/history", historyRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
