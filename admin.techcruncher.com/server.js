// dotenv must run before anything that reads process.env at require time
// (Cloudinary is configured the moment its module is loaded).
require("dotenv").config();

const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`❌ Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const app = require("./app");
const connectDB = require("./config/db");

const dailyAutoUpdateJob = require("./jobs/dailyAutoUpdate.job");
const publishScheduledJob = require("./jobs/publishScheduled.job");

const PORT = Number(process.env.PORT) || 7000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Start cron jobs only after DB is connected.
    publishScheduledJob();

    // The AI auto-news job spends API credits and writes articles, so it must be
    // switched on explicitly — and on exactly one instance.
    if (process.env.ENABLE_AUTO_NEWS === "true") {
      dailyAutoUpdateJob();
    } else {
      console.log("⏸️  Auto-news job disabled (set ENABLE_AUTO_NEWS=true to enable)");
    }
  })
  .catch((err) => {
    console.error("❌ Could not connect to MongoDB, exiting:", err.message);
    process.exit(1);
  });
