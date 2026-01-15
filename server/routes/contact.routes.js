// routes/contact.routes.js
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ msg: "All fields required" });
  }

  // later: save to DB / send email
  res.status(200).json({ msg: "Message received" });
});

module.exports = router;
