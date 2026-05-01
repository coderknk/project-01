const express = require("express");
const { signup, login, refresh, me } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { authRateLimiter } = require("../middleware/rateLimitMiddleware");
const {
  signupValidation,
  loginValidation,
  refreshValidation,
} = require("../validators");

const router = express.Router();

router.post("/signup", authRateLimiter, signupValidation, validate, signup);
router.post("/register", authRateLimiter, signupValidation, validate, signup);
router.post("/login", authRateLimiter, loginValidation, validate, login);
router.post("/refresh", refreshValidation, validate, refresh);
router.get("/me", protect, me);

module.exports = router;
