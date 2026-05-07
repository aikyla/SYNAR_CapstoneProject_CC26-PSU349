const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");

// POST /api/auth/register — Daftar user baru
router.post("/register", register);

// POST /api/auth/login — Login dan dapatkan JWT token
router.post("/login", login);

module.exports = router;