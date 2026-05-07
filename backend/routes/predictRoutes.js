const express = require("express");
const router = express.Router();

const { predict } = require("../controllers/predictController");

// POST /api/predict — Kirim prediksi ke AI service (atau dummy)
router.post("/", predict);

module.exports = router;
