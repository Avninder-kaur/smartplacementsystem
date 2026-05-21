// Authentication middleware for secure routes
const express = require("express");
const router = express.Router();
const {
  register,
  login,
  googleLogin,
  getMe,
  updateProfile,
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

// Public
router.post("/register", upload.any(), register);
router.post("/login",    login);
router.post("/google", googleLogin);

// Protected
router.get("/me",         protect, getMe);
router.put("/profile",    protect, upload.any(), updateProfile);

module.exports = router;
