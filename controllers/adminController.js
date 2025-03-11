const Donation = require("../models/Donation");
const Offer = require("../models/Offer");

// Get total donations & offers
exports.getDashboardStats = async (req, res) => {
    try {
        const totalDonations = await Donation.countDocuments({ status: "Approved" });
        const totalOffers = await Offer.countDocuments({ status: "Paid" });

        res.json({ totalDonations, totalOffers });
    } catch (error) {
        res.status(500).json({ message: "Error fetching dashboard stats", error });
    }
};
// Get leaderboard data
exports.getLeaderboard = async (req, res) => {
    try {
        const topDonors = await Donation.aggregate([
            { $group: { _id: "$donorName", totalAmount: { $sum: "$amount" } } },
            { $sort: { totalAmount: -1 } },
            { $limit: 5 },
        ]);

        const topVolunteers = await Donation.aggregate([
            { $group: { _id: "$volunteer", totalDonations: { $sum: "$amount" } } },
            { $sort: { totalDonations: -1 } },
            { $limit: 5 },
        ]);

        res.json({ topDonors, topVolunteers });
    } catch (error) {
        res.status(500).json({ message: "Error fetching leaderboard", error });
    }
};
