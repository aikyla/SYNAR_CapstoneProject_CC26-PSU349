const express = require("express");
const router = express.Router();

const { createHistory, getHistoryByUser, deleteHistory } = require("../controllers/historyController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);
router.post("/", createHistory);
router.get("/:userId", getHistoryByUser);
router.delete("/:historyId", deleteHistory);

module.exports = router;
