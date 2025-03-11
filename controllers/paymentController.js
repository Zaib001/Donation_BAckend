const Donation = require("../models/Donation");



// @desc Submit offline payment (GPay/By Hand)
// @route POST /api/payments/offline
// @access Donor
exports.submitOfflinePayment = async (req, res) => {
    try {
        const { amount, cause, volunteerId, paymentMethod, transactionId } = req.body;

        if (!amount || !cause || !volunteerId || !paymentMethod) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        const donation = await Donation.create({
            donor: req.user.id,
            amount,
            cause,
            paymentMethod,
            transactionId,
            volunteer: volunteerId,
            status: "pending"
        });

        res.status(201).json({
            success: true,
            message: "Offline payment recorded, awaiting admin approval",
            donation
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to record offline payment", error: error.message });
    }
};
