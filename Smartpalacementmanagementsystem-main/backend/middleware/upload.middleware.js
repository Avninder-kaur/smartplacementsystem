const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    // Ensure uploads directory exists to avoid runtime errors
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const userId = req.user?.id || "guest";
    const filePrefix = file.fieldname === "resume" ? "resume" : "profile";
    cb(null, `${filePrefix}-${userId}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Allow images for profilePic
  const imageTypes = [".jpg", ".jpeg", ".png", ".webp"];
  // Allow documents for resume
  const documentTypes = [".pdf", ".doc", ".docx"];
  
  if (file.fieldname === "profilePic" && imageTypes.includes(ext)) {
    cb(null, true);
  } else if (file.fieldname === "resume" && documentTypes.includes(ext)) {
    cb(null, true);
  } else if (file.fieldname === "profilePic") {
    cb(new Error("Only JPG, JPEG, PNG, and WEBP files are allowed for profile picture"), false);
  } else if (file.fieldname === "resume") {
    cb(new Error("Only PDF, DOC, and DOCX files are allowed for resume"), false);
  } else {
    cb(new Error("Unknown file type"), false);
  }
};

// Create an instance that can handle multiple file fields
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Export a helper function that handles both single and multiple files
upload.any = function() {
  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  }).any();
};

module.exports = upload;
