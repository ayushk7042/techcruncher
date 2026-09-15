const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const errorHandler = require("./middlewares/error.middleware");
const { loginLimiter, publicWriteLimiter } = require("./middlewares/rateLimit.middleware");

const app = express();

// Behind a reverse proxy in production; needed for correct req.ip (rate limits).
app.set("trust proxy", 1);

/* =========================
   MIDDLEWARES
========================= */

app.use(compression());
app.use(cookieParser());

const DEFAULT_ORIGINS = [
  "https://techcruncher.com",
  "https://www.techcruncher.com",
  "https://admin.techcruncher.com",
];

const ALLOWED_ORIGINS = new Set([
  ...DEFAULT_ORIGINS,
  ...(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

/**
 * Dev servers move to the next free port when the default is taken, so outside
 * production any localhost origin is accepted.
 */
const isDevOrigin = (origin) =>
  process.env.NODE_ENV !== "production" &&
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

app.use(
  cors({
    // Same-origin and server-to-server calls arrive without an Origin header.
    // Disallowed origins simply get no CORS headers (the browser blocks them).
    origin: (origin, callback) =>
      callback(null, !origin || ALLOWED_ORIGINS.has(origin) || isDevOrigin(origin)),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Disposition"],
    credentials: true,
  })
);

// Articles and homepage layouts carry full rich-text HTML; everything else is small.
app.use(["/api/news", "/api/homepage"], express.json({ limit: "25mb" }));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

/* =========================
   RATE LIMITS
========================= */

app.use("/api/auth/login", loginLimiter);
app.post(
  [
    "/api/contact",
    "/api/newsletter/subscribe",
    "/api/newsletter/unsubscribe",
    "/api/news/:slug/like",
    "/api/news/:slug/share",
    "/api/ads/:id/impression",
    "/api/ads/:id/click",
  ],
  publicWriteLimiter
);

/* =========================
   ROUTES
========================= */

app.get("/api/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/contact", require("./routes/contact.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/news", require("./routes/news.routes"));
app.use("/api/homepage", require("./routes/homepage.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/auto-news", require("./routes/autoNews.routes"));
app.use("/api/tags", require("./routes/tag.routes"));
app.use("/api/media", require("./routes/media.routes"));
app.use("/api/ads", require("./routes/advertisement.routes"));
app.use("/api/import", require("./routes/import.routes"));
app.use("/api/newsletter", require("./routes/newsletter.routes"));

app.use("/api", (req, res) => res.status(404).json({ success: false, message: "Not found" }));

/* =========================
   ERROR HANDLER (LAST)
========================= */

// Multer rejects oversized or wrong-typed uploads with its own error class;
// translate those into a clean 400 instead of a 500.
app.use((err, req, res, next) => {
  if (err && (err.name === "MulterError" || /file|upload/i.test(err.message || ""))) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

app.use(errorHandler);

module.exports = app;
