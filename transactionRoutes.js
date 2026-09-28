const router = require("express").Router();
const controller = require("../controllers/transactionController");
const { protect, adminOnly } = require("../middleware/auth");

router.post("/issue", protect, controller.issueBook);
router.get("/", protect, controller.getTransactions);
router.get("/my", protect, controller.getTransactions);
router.put("/:id/return", protect, controller.returnBook);
router.get("/stats", protect, adminOnly, controller.stats);

module.exports = router;
