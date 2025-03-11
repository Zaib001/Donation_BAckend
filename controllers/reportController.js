const Donation = require('../models/Donation');
const Offer = require('../models/Offer');
const Volunteer = require('../models/Volunteer');
const User = require('../models/User');

// @desc Get donation reports by date, method, and monthly donations
// @route GET /api/reports/donations
// @access Admin
exports.getDonationReports = async (req, res) => {
    try {
        const { startDate, endDate, paymentMethod } = req.query;

        let filter = {};
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        if (paymentMethod) {
            filter.paymentMethod = paymentMethod;
        }

        const donations = await Donation.find(filter)
            .populate('donor', 'name email')
            .populate('volunteer', 'name');

        const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);

        // ✅ Calculate Monthly Donations
        const monthlyDonations = await Donation.aggregate([
            {
                $match: filter
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, 
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            totalDonations: donations.length,
            totalAmount,
            donations,
            monthlyDonations
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch donation reports', error: error.message });
    }
};

// @desc Get offer reports by date, status, and monthly offers
// @route GET /api/reports/offers
// @access Admin
exports.getOfferReports = async (req, res) => {
    try {
        const { startDate, endDate, status } = req.query;

        let filter = {};
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        if (status) {
            filter.status = status;
        }

        const offers = await Offer.find(filter)
            .populate('donor', 'name email')
            .populate('volunteer', 'name');

        const totalOfferAmount = offers.reduce((sum, offer) => sum + offer.amount, 0);

        // ✅ Calculate Monthly Offers
        const monthlyOffers = await Offer.aggregate([
            {
                $match: filter
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            totalOffers: offers.length,
            totalOfferAmount,
            offers,
            monthlyOffers
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch offer reports', error: error.message });
    }
};

// @desc Get volunteer contributions
// @route GET /api/reports/volunteers
// @access Admin
exports.getVolunteerContributions = async (req, res) => {
    try {
        const volunteers = await Volunteer.find().populate('assignedDonations');

        const contributions = volunteers.map(volunteer => ({
            volunteerName: volunteer.name,
            totalDonations: volunteer.assignedDonations.length,
            totalAmount: volunteer.assignedDonations.reduce((sum, donation) => sum + donation.amount, 0)
        }));

        res.status(200).json({
            success: true,
            contributions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch volunteer contributions', error: error.message });
    }
};

// @desc Get top donors & top volunteers (Leaderboard)
// @route GET /api/reports/leaderboard
// @access Admin
exports.getLeaderboard = async (req, res) => {
    try {
        // Top Donors
        const topDonors = await Donation.aggregate([
            { $group: { _id: "$donor", totalDonations: { $sum: "$amount" }, count: { $sum: 1 } } },
            { $sort: { totalDonations: -1 } },
            { $limit: 5 }
        ]);

        for (let donor of topDonors) {
            let donorDetails = await User.findById(donor._id).select('name email');
            donor.name = donorDetails ? donorDetails.name : "Unknown";
            donor.email = donorDetails ? donorDetails.email : "Unknown";
        }

        // Top Volunteers
        const topVolunteers = await Donation.aggregate([
            { $group: { _id: "$volunteer", totalManaged: { $sum: "$amount" }, count: { $sum: 1 } } },
            { $sort: { totalManaged: -1 } },
            { $limit: 5 }
        ]);

        for (let volunteer of topVolunteers) {
            let volunteerDetails = await Volunteer.findById(volunteer._id).select('name');
            volunteer.name = volunteerDetails ? volunteerDetails.name : "Unknown";
        }

        res.status(200).json({
            success: true,
            leaderboard: {
                topDonors,
                topVolunteers
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch leaderboard data', error: error.message });
    }
};
