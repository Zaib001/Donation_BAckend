const express = require('express');
const {
    getDonationReports,
    getVolunteerContributions,
    getOfferReports,
    getLeaderboard
} = require('../controllers/reportController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/donations', protect, adminOnly, getDonationReports);
router.get('/volunteers', protect, adminOnly, getVolunteerContributions);
router.get('/offers', protect, adminOnly, getOfferReports);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
