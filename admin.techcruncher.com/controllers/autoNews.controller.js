const { runAutoNews } = require("../jobs/dailyAutoUpdate.job");

/** POST /api/auto-news/run — runs the AI auto-news job once, creating drafts. */
exports.runAutoNews = async (req, res) => {
  try {
    const count = await runAutoNews();
    res.json({
      message: count ? `Created ${count} draft article(s) for review.` : "No new articles were found.",
      count,
    });
  } catch (err) {
    if (err.statusCode && err.statusCode < 500) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error("runAutoNews error:", err);
    res.status(500).json({ message: "Auto-news failed" });
  }
};
