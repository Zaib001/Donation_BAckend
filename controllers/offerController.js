const Offer = require('../models/Offer');
const Donation = require('../models/Donation');
const Volunteer = require('../models/Volunteer');

// @desc Create a new offer
// @route POST /api/offers/create
// @access Donor
exports.createOffer = async (req, res) => {
    try {
        const { amount, cause,whatsapp, volunteerId } = req.body;

        // Validate inputs
        if (!amount || !cause || !volunteerId || !whatsapp) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        // Check if volunteer exists
        const volunteer = await Volunteer.findById(volunteerId);
        if (!volunteer) {
            return res.status(404).json({ success: false, message: "Volunteer not found." });
        }

        // Create offer
        const offer = await Offer.create({
            donor: req.user.id,
            amount,
            cause,
            whatsapp,
            volunteer: volunteerId,
            status: 'unpaid'
        });

        res.status(201).json({
            success: true,
            message: "Offer created successfully",
            offer
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// @desc Get all offers
// @route GET /api/offers
// @access Admin/Volunteers
exports.getAllOffers = async (req, res) => {
    try {
        const offers = await Offer.find()
            .populate('donor', 'name email whatsapp')
            .populate('volunteer', 'name');

        res.status(200).json({ success: true, offers });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};



// @desc Convert an offer to a donation (Mark Paid)
// @route PUT /api/offers/mark-paid/:id
// @access Volunteer
exports.markOfferAsPaid = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Populate donor details to get donor name & whatsapp
        const offer = await Offer.findById(id)
            .populate('donor', 'name email whatsapp')
            .populate('volunteer', 'name');

        if (!offer) {
            return res.status(404).json({ success: false, message: "Offer not found" });
        }

        if (offer.status === 'paid') {
            return res.status(400).json({ success: false, message: "Offer is already marked as paid" });
        }

        // ✅ Ensure donorName exists before creating donation
        if (!offer.donor || !offer.donor.name) {
            return res.status(400).json({ success: false, message: "Offer is missing donor details" });
        }

        // ✅ Convert offer to a donation (Include donorName explicitly)
        const donation = await Donation.create({
            donor: offer.donor._id,
            donorName: offer.donor.name,  // ✅ Include donor name
            amount: offer.amount,
            cause: offer.cause,
            paymentMethod: "by_hand",
            status: "approved",
            volunteer: offer.volunteer?._id || null,  // ✅ Handle missing volunteer gracefully
        });

        // ✅ Mark offer as paid
        offer.status = 'paid';
        await offer.save();


        res.status(200).json({
            success: true,
            message: "Offer marked as paid and converted to donation",
            donation
        });

    } catch (error) {
        console.error("Error marking offer as paid:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};



// @desc Delete an offer
// @route DELETE /api/offers/delete/:id
// @access Admin
exports.deleteOffer = async (req, res) => {
    try {
        const { id } = req.params;

        const offer = await Offer.findById(id);
        if (!offer) {
            return res.status(404).json({ success: false, message: "Offer not found" });
        }

        await offer.deleteOne();
        res.status(200).json({ success: true, message: "Offer deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
exports.confirmOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const offer = await Offer.findById(id);

        if (!offer) {
            return res.status(404).json({ success: false, message: "offer not found" });
        }

        offer.status = "Completed";
        await offer.save();

        res.status(200).json({ success: true, message: "offer marked as completed", offer });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to confirm donation", error: error.message });
    }
};