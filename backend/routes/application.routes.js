const express = require("express");
const router = express.Router();
const {
  applyToJob,
  getStudentApplications,
  getApplicantsForJob,
  updateApplicationStatus,
  getAllRecruiterApplications,
} = require("../controllers/application.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

<<<<<<< HEAD
// Student routes
router.post("/apply",   protect, authorize("student"), upload.single("resume"), applyToJob);
router.get( "/student", protect, authorize("student"), getStudentApplications);
=======
// API endpoint for student applications
// Student routes
router.post("/apply-job",   protect, authorize("student"), upload.single("resume"), applyToJob);
router.get( "/student-applications", protect, authorize("student"), getStudentApplications);
>>>>>>> e43cb6de4a7972b30d4ee8d2d91bda11c6044968

// Recruiter routes
router.get("/recruiter/all",      protect, authorize("recruiter"), getAllRecruiterApplications);
router.get("/recruiter/:jobId",   protect, authorize("recruiter"), getApplicantsForJob);
router.put("/status/:id",         protect, authorize("recruiter"), updateApplicationStatus);

module.exports = router;
