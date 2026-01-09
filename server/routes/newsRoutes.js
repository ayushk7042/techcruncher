const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/newsController");

router.post("/", auth, controller.createNews);
router.put("/:id", auth, controller.updateNews);
router.delete("/:id", auth, controller.deleteNews);

router.get("/category/:categoryId", controller.getNewsByCategory);
router.post("/affiliate-click", controller.trackAffiliateClick);
// 🔥 ADMIN – GET ALL NEWS
router.get("/", auth, controller.getAllNews);
router.get("/:id", controller.getSingleNews);


module.exports = router;
