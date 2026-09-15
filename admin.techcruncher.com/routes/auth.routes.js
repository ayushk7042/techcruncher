const express = require("express");
const router = express.Router();

const { registerAdmin, loginAdmin } = require("../controllers/auth.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const superadminOnly = (req, res, next) =>
  req.admin?.role === "superadmin"
    ? next()
    : res.status(403).json({ success: false, message: "Only a superadmin can create admins" });

// The first superadmin is created with `node create-admin.js`; after that only
// a signed-in superadmin can add accounts.
router.post("/register", authMiddleware, superadminOnly, registerAdmin);
router.post("/login", loginAdmin);

module.exports = router;
