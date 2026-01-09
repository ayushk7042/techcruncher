const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },

  title: {
    type: String,
    required: true
  },

  subtitle: String,

  description: {
    type: String,
    required: true
  },

  contentBlocks: [
    {
      type: {
        type: String,
        enum: ["text", "link", "image", "affiliate"],
        default: "text"
      },
      value: String
    }
  ],

  image: {
    public_id: String,
    url: String
  },

  affiliateLinks: [
    {
      title: String,
      link: String,
      buttonText: String,
      clicks: { type: Number, default: 0 }
    }
  ],

  externalLink: String,

  adsLink: String,

  // 🔥 HOMEPAGE CONTROL
  isMainTrending: {
    type: Boolean,
    default: false
  },

  isSubTrending: {
    type: Boolean,
    default: false
  },

  homeOrder: {
    type: Number,
    default: 0
  },

  // 🔥 CATEGORY PAGE CONTROL
  isCategoryTrending: {
    type: Boolean,
    default: false
  },

  isCategorySubTrending: {
    type: Boolean,
    default: false
  },

  // 📊 ANALYTICS
  views: {
    type: Number,
    default: 0
  },

  clicks: {
    type: Number,
    default: 0
  },

  // 🧠 SEO
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],

  // 💰 AFFILIATE TYPE
  isSponsored: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    enum: ["draft", "published"],
    default: "published"
  }

}, { timestamps: true });

module.exports = mongoose.model("News", newsSchema);
