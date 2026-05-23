const express = require("express");
const router = express.Router();

const { getRealtime, searchLocation, reverseLocation } = require("../controllers/weatherController");

router.get("/realtime", getRealtime);
router.get("/geocode/search", searchLocation);
router.get("/geocode/reverse", reverseLocation);

module.exports = router;
