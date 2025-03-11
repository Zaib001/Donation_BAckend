const razorpay = require("../config/razorpay");
const Donation = require("../models/Donation");
const { v4: uuidv4 } = require("uuid");

// @desc Initiate payment via Razorpay
// @route POST /api/payments/initiate
// @access Donor
exports.initiatePayment = async (req, res) => {
    try {
        const { amount, cause } = req.body;

        if (!amount || !cause) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        const options = {
            amount: amount * 100, // Convert to paise
            currency: "INR",
            receipt: `${Date.now()}`,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);
        console.log("Razorpay Order Created:", order);

        res.status(200).json({
            success: true,
            message: "Payment initiated",
            order
        });

    } catch (error) {
        console.error("Razorpay Payment Error:", error); // Log full error details
        res.status(500).json({ success: false, message: "Razorpay payment initiation failed", error: error.message });
    }
};


// @desc Verify payment success
// @route POST /api/payments/verify
// @access Admin
exports.verifyPayment = async (req, res) => {
    try {
        const { paymentId, orderId, signature, donorId, amount, cause, volunteerId } = req.body;

        if (!paymentId || !orderId || !signature || !donorId || !amount || !cause || !volunteerId) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        // Create donation entry
        const donation = await Donation.create({
            donor: donorId,
            amount,
            cause,
            paymentMethod: "razorpay",
            transactionId: paymentId,
            status: "approved",
            volunteer: volunteerId
        });

        res.status(200).json({
            success: true,
            message: "Payment verified and donation recorded",
            donation
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Payment verification failed", error: error.message });
    }
};

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
