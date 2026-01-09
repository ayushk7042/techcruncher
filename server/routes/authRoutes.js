const router = require("express").Router();
const { loginAdmin } = require("../controllers/authController");

router.post("/login", loginAdmin);

module.exports = router;
