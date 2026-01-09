const News = require("../models/News");
const Category = require("../models/Category");
/**
 * CREATE NEWS
 */
exports.createNews = async (req, res) => {
  const news = await News.create(req.body);
  res.json(news);
};

/**
 * UPDATE NEWS
 */
exports.updateNews = async (req, res) => {
  const news = await News.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(news);
};

/**
 * DELETE NEWS
 */
exports.deleteNews = async (req, res) => {
  await News.findByIdAndDelete(req.params.id);
  res.json({ message: "News deleted" });
};

/**
 * GET NEWS BY CATEGORY
 */


exports.getNewsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // 1️⃣ category validate
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
        news: [],
        category: null
      });
    }

    // 2️⃣ category _id se news lao
    const news = await News.find({
      category: categoryId,
      status: "published"
    })
      .sort({ createdAt: -1 })
      .populate("category", "name");

    res.json({
      category,
      news
    });

  } catch (err) {
    console.error("getNewsByCategory error:", err);
    res.status(500).json({
      message: "Server error",
      news: [],
      category: null
    });
  }
};

// exports.getNewsByCategory = async (req, res) => {
//   const news = await News.find({
//     category: req.params.categoryId,
//     status: "published"
//   }).sort({ createdAt: -1 });

//   res.json(news);
// };



// 🔥 GET ALL NEWS (ADMIN)
exports.getAllNews = async (req, res) => {
  const news = await News.find()
    .populate("category")
    .sort({ createdAt: -1 });

  res.json(news);
};


/**
 * AFFILIATE CLICK TRACKING (SAFE)
 */
exports.trackAffiliateClick = async (req, res) => {
  const { newsId, affiliateIndex } = req.body;

  const news = await News.findById(newsId);
  if (!news) {
    return res.status(404).json({ message: "News not found" });
  }

  if (!news.affiliateLinks[affiliateIndex]) {
    return res.status(400).json({ message: "Invalid affiliate index" });
  }

  news.affiliateLinks[affiliateIndex].clicks += 1;
  news.clicks += 1;

  await news.save();
  res.json({ success: true });
};
// 🔥 GET SINGLE NEWS
exports.getSingleNews = async (req, res) => {
  const news = await News.findById(req.params.id)
    .populate("category");

  res.json(news);
};
