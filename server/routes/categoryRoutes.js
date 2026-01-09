const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/categoryController");

router.post("/", auth, controller.createCategory);
router.put("/:id", auth, controller.updateCategory);
router.delete("/:id", auth, controller.deleteCategory);
router.get("/", controller.getCategories);

module.exports = router;
