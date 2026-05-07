const express = require("express");
const router = express.Router();

const { createHistory, getHistoryByUser } = require("../controllers/historyController");
const authMiddleware = require("../middlewares/authMiddleware");

// Semua route history membutuhkan autentikasi
router.use(authMiddleware);

// POST /api/history — Simpan hasil prediksi ke history
router.post("/", createHistory);

// GET /api/history/:userId — Ambil history berdasarkan userId
router.get("/:userId", getHistoryByUser);

module.exports = router;
