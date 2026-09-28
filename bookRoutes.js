const router = require("express").Router();
const controller = require("../controllers/bookController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/", protect, controller.getBooks);
router.get("/:id", protect, controller.getBook);
router.post("/", protect, adminOnly, controller.createBook);
router.put("/:id", protect, adminOnly, controller.updateBook);
router.delete("/:id", protect, adminOnly, controller.deleteBook);

module.exports = router;
