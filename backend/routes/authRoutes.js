const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateMe,
  forgotPassword,
  resetPassword,
  deleteMe,
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);
router.delete("/me", authMiddleware, deleteMe);

module.exports = router;
