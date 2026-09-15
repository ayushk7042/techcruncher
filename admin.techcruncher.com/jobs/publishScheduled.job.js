const cron = require("node-cron");
const News = require("../models/News");
const { notifySubscribers } = require("../services/newsletterNotify.service");

/**
 * Flips scheduled articles to published once their time arrives, then tells
 * newsletter subscribers. Runs every minute; a no-op when nothing is due.
 */
const publishScheduledJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const due = { status: "scheduled", scheduledAt: { $ne: null, $lte: now }, deletedAt: null };

      const ids = await News.distinct("_id", due);
      if (!ids.length) return;

      const result = await News.updateMany(
        { ...due, _id: { $in: ids } },
        [
          {
            $set: {
              status: "published",
              publishedDate: { $ifNull: ["$scheduledAt", now] },
              scheduledAt: null,
            },
          },
        ],
        // Mongoose 9 requires opting in before it sends an aggregation pipeline update.
        { updatePipeline: true }
      );

      if (result.modifiedCount) {
        console.log(`🗓️  Published ${result.modifiedCount} scheduled article(s)`);
        await notifySubscribers(ids);
      }
    } catch (err) {
      console.error("publishScheduledJob error:", err.message);
    }
  });

  console.log("🗓️  Scheduled-publish job registered (every minute)");
};

module.exports = publishScheduledJob;
