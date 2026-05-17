const express = require("express");
const router = express.Router();

const { predict } = require("../controllers/predictController");

// POST /api/predict - Kirim prediksi ke AI service
router.post("/", predict);

module.exports = router;
