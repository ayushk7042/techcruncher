const mongoose = require("mongoose");

/**
 * Connects once; the caller decides what to do on failure.
 * Index builds on boot are only automatic outside production — build them
 * deliberately there so a deploy never blocks on a large index.
 */
const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    autoIndex: process.env.NODE_ENV !== "production",
  });

  console.log("✅ MongoDB Connected");
};

module.exports = connectDB;
