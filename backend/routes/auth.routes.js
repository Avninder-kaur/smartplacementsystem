<<<<<<< HEAD
=======
// Route protection middleware applied for authenticated users
>>>>>>> e43cb6de4a7972b30d4ee8d2d91bda11c6044968
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
