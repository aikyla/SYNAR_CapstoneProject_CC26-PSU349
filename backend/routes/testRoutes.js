const express = require("express");
const router = express.Router();

const { getTest, getProtected, testDatabase } = require("../controllers/testController");
const authMiddleware = require("../middlewares/authMiddleware");

// Public test routes
router.get("/", getTest);
router.get("/db", testDatabase);

// Protected test route (requires JWT)
router.get("/protected", authMiddleware, getProtected);

module.exports = router;