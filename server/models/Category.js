const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  slug: {
    type: String,
    unique: true
  },

  description: String,

  icon: String,

  seoTitle: String,
  seoDescription: String,

  showOnHome: {
    type: Boolean,
    default: true
  },

  order: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  }

}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);
