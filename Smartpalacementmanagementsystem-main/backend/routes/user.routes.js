const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const { getProfile, updateProfile, getDashboard } = require("../controllers/user.controller");

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.any(), updateProfile);
router.get("/dashboard", protect, getDashboard);

module.exports = router;
