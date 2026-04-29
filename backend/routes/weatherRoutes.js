const express = require("express");
const router = express.Router();

const { getRealtime } = require("../controllers/weatherController");

router.get("/realtime", getRealtime);

module.exports = router;
