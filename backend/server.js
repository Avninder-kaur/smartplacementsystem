const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

app.use(helmet());

const defaultOrigins = [
  "http://localhost:8081",
  "http://localhost:5173",
  "http://127.0.0.1:8081",
  "http://127.0.0.1:5173",
];
const envOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

const isLocalhostOrigin = (origin = "") =>
  /^https?:\/\/localhost(?::\d+)?$/.test(origin) ||
  /^https?:\/\/127\.0\.0\.1(?::\d+)?$/.test(origin);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (no Origin header), explicit allowlist,
      // and localhost with any port in development.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes("*")) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (process.env.NODE_ENV !== "production" && isLocalhostOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "SmartPlacement API is running" });
});

// API Routes - ALL registered BEFORE 404 & error handlers
app.use("/api/auth",         require("./routes/auth.routes"));
app.use("/api/user",         require("./routes/user.routes"));
app.use("/api/jobs",         require("./routes/job.routes"));
app.use("/api/applications", require("./routes/application.routes"));
app.use("/api/admin",        require("./routes/admin.routes"));

// Catch-all 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Centralized error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.message || err);

  // Handle Multer upload errors
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, message: "File size exceeds 5MB limit" });
    }
    return res.status(400).json({ success: false, message: err.message });
  }

  // Handle custom upload/client validation errors (e.g., fileFilter rejections)
  if (err.status === 400 || (err.message && err.message.includes("allowed for"))) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Handle Mongoose CastError (e.g., malformed ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: `Invalid ${err.path}: ${err.value}` });
  }

  // Handle Mongoose ValidationError
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(", ") });
  }

  // Never expose raw stack traces in responses
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
});
