const express = require("express");
const router = express.Router();

const { createHistory, getHistoryByUser } = require("../controllers/historyController");
const authMiddleware = require("../middlewares/authMiddleware");

// All history routes require authentication
router.use(authMiddleware);

router.post("/", createHistory);
router.get("/:userId", getHistoryByUser);

module.exports = router;
