const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    message: {
      type: String,
      required: true,
    },
    adminReply: {
      type: String,
      default: "",
    },
    repliedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
