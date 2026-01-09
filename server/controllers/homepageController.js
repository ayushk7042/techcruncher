const Homepage = require("../models/Homepage");

/**
 * SET / UPDATE HOMEPAGE
 * RULES:
 * - 1 mainTrending required
 * - Max 5 subTrending
 * - Each category: 1 trending + max 5 subTrending
 */
exports.setHomepage = async (req, res) => {
  try {
    const {
      mainTrending,
      subTrending = [],
      categorySections = [],
      customHomeBlocks = []
    } = req.body;

    if (!mainTrending) {
      return res.status(400).json({ message: "Main trending is required" });
    }

    if (subTrending.length > 5) {
      return res.status(400).json({ message: "Only 5 sub trending allowed" });
    }

    for (let sec of categorySections) {
      if (!sec.trending) {
        return res.status(400).json({
          message: "Each category must have 1 trending post"
        });
      }

      if (sec.subTrending && sec.subTrending.length > 5) {
        return res.status(400).json({
          message: "Only 5 sub trending allowed per category"
        });
      }
    }

    let homepage = await Homepage.findOne();

    if (!homepage) {
      homepage = await Homepage.create({
        mainTrending,
        subTrending,
        categorySections,
        customHomeBlocks
      });
    } else {
      homepage.mainTrending = mainTrending;
      homepage.subTrending = subTrending;
      homepage.categorySections = categorySections;
      homepage.customHomeBlocks = customHomeBlocks;
      await homepage.save();
    }

    res.json({ success: true, homepage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * NORMAL HOMEPAGE (POPULATE)
 */
exports.getHomepage = async (req, res) => {
  const homepage = await Homepage.findOne()
    .populate("mainTrending")
    .populate("subTrending")
    .populate("categorySections.category")
    .populate("categorySections.trending")
    .populate("categorySections.subTrending");

  res.json(homepage);
};

/**
 * FAST HOMEPAGE (AGGREGATION)
 */
exports.getHomepageFast = async (req, res) => {
  const data = await Homepage.aggregate([
    {
      $lookup: {
        from: "news",
        localField: "mainTrending",
        foreignField: "_id",
        as: "mainTrending"
      }
    },
    { $unwind: "$mainTrending" },

    {
      $lookup: {
        from: "news",
        localField: "subTrending",
        foreignField: "_id",
        as: "subTrending"
      }
    },

    {
      $lookup: {
        from: "categories",
        localField: "categorySections.category",
        foreignField: "_id",
        as: "categories"
      }
    }
  ]);

  res.json(data[0]);
};
