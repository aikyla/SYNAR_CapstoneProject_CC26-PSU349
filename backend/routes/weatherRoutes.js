const express = require("express");
const router = express.Router();

const { getRealtime } = require("../controllers/weatherController");

// GET /api/weather/realtime — Ambil data cuaca realtime
router.get("/realtime", getRealtime);

module.exports = router;
