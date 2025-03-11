const express = require("express");
const { getDashboardStats } = require("../controllers/adminController");
const router = express.Router();

router.get("/dashboard", getDashboardStats);
router.get("/leaderboard", getLeaderboard);

module.exports = router;
