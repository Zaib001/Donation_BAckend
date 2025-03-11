const express = require("express");
const { submitOfflinePayment } = require("../controllers/paymentController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/offline", protect, submitOfflinePayment);

module.exports = router;
