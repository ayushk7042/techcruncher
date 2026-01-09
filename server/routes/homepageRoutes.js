const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/homepageController");

router.post("/", auth, controller.setHomepage);
router.get("/", controller.getHomepage);
router.get("/fast", controller.getHomepageFast);


module.exports = router;
