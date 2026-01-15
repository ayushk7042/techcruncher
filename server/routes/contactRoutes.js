const router = require("express").Router();
const {
  sendContact,
  getAllContacts,
  replyContact,
} = require("../controllers/contactController");
const adminAuth = require("../middleware/authMiddleware");

/* USER */
router.post("/", sendContact);

/* ADMIN */
router.get("/", adminAuth, getAllContacts);
router.post("/:id/reply", adminAuth, replyContact);

module.exports = router;
