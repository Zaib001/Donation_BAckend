const express = require("express");
const { initiatePayment, verifyPayment, submitOfflinePayment } = require("../controllers/paymentController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/initiate", protect, initiatePayment);
router.post("/verify", protect, adminOnly, verifyPayment);
router.post("/offline", protect, submitOfflinePayment);

module.exports = router;
