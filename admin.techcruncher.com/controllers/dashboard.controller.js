const Category = require("../models/Category");
const News = require("../models/News");
const Contact = require("../models/Contact");

exports.getDashboardData = async (req, res) => {
  try {
    // Trashed articles are excluded from every article figure.
    const live = { deletedAt: null };

    const [categories, totalNews, publishedNews, draftNews, aiNews, autoUpdateNews, seoAgg, newContacts] =
      await Promise.all([
        Category.countDocuments(),
        News.countDocuments(live),
        News.countDocuments({ ...live, status: "published" }),
        News.countDocuments({ ...live, status: "draft" }),
        News.countDocuments({ ...live, aiGenerated: true }),
        News.countDocuments({ ...live, autoUpdateEnabled: true }),
        News.aggregate([{ $match: live }, { $group: { _id: null, avgSeoScore: { $avg: "$seoScore" } } }]),
        Contact.countDocuments({ status: "new" }),
      ]);

    res.json({
      categories,
      totalNews,
      publishedNews,
      draftNews,
      aiNews,
      autoUpdateNews,
      avgSeoScore: seoAgg.length ? Math.round(seoAgg[0].avgSeoScore || 0) : 0,
      newContacts,
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ message: "Dashboard error" });
  }
};
