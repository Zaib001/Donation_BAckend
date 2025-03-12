const Volunteer = require('../models/Volunteer');
const Donation = require('../models/Donation');
const Offer = require("../models/Offer");
const User = require('../models/User');


const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.downloadReceipt = async (req, res) => {
  try {
    const { donationId } = req.params;

    // Fetch donation details
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    // Create PDF Document
    const doc = new PDFDocument({ size: "A4", layout: "landscape" });

    const fileName = `Donation_Receipt_${donationId}.pdf`;
    const filePath = path.join(__dirname, "../receipts", fileName);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // **Set Background Image**
    const backgroundImage = path.join(__dirname, "../templates/re.jpg");
    doc.image(backgroundImage, 0, 0, { width: 842, height: 595 });

    // **Overlay Donor Name (Adjust X, Y positions)**
    doc.font("Helvetica-Bold").fontSize(20).fillColor("black").text(donation.donorName, 95, 340);

    // **Overlay Donation Amount in Red**
    doc.font("Helvetica-Bold").fontSize(22).fillColor("red").text(`₹ ${donation.amount}`, 100, 495);

    // Finalize
    doc.end();

    stream.on("finish", () => {
      res.download(filePath, fileName);
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error generating receipt", error: error.message });
  }
};

// @desc Add a new volunteer
// @route POST /api/volunteers/add
// @access Admin
exports.addVolunteer = async (req, res) => {
    try {
        const { name, phone, email } = req.body;

        // Check if volunteer already exists
        const existingVolunteer = await Volunteer.findOne({ email });
        if (existingVolunteer) {
            return res.status(400).json({ success: false, message: "Volunteer with this email already exists" });
        }

        const newVolunteer = await Volunteer.create({ name, phone, email });

        res.status(201).json({
            success: true,
            message: "Volunteer added successfully",
            volunteer: newVolunteer
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// @desc Get all volunteers
// @route GET /api/volunteers
// @access Admin
exports.getVolunteers = async (req, res) => {
    try {
        // Find users with the role of "volunteer" and exclude the password field
        const volunteers = await User.find({ role: 'volunteer' }).select('-password');
        
        // Return the list of volunteers
        res.status(200).json({ success: true, data: volunteers });
    } catch (err) {
        // Handle errors
        res.status(500).json({ success: false, msg: 'Failed to retrieve volunteers', error: err.message });
    }
};

// @desc Update a volunteer
// @route PUT /api/volunteers/update/:id
// @access Admin
exports.updateVolunteer = async (req, res) => {
    try {
        const { name, phone, email } = req.body;
        const { id } = req.params;

        const volunteer = await Volunteer.findById(id);
        if (!volunteer) {
            return res.status(404).json({ success: false, message: "Volunteer not found" });
        }

        volunteer.name = name || volunteer.name;
        volunteer.phone = phone || volunteer.phone;
        volunteer.email = email || volunteer.email;

        await volunteer.save();

        res.status(200).json({
            success: true,
            message: "Volunteer updated successfully",
            volunteer
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// @desc Delete a volunteer
// @route DELETE /api/volunteers/delete/:id
// @access Admin
exports.deleteVolunteer = async (req, res) => {
    try {
        const { id } = req.params;

        const volunteer = await Volunteer.findById(id);
        if (!volunteer) {
            return res.status(404).json({ success: false, message: "Volunteer not found" });
        }

        await volunteer.deleteOne();
        res.status(200).json({ success: true, message: "Volunteer deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
exports.getAssignedDonations = async (req, res) => {
    try {
        const { volunteerId } = req.params;

        const assignedDonations = await Donation.find({ volunteer: volunteerId });
        console.log(assignedDonations)
        if (!assignedDonations.length) {
            return res.status(404).json({ success: false, message: "No assigned donations found." });
        }

        res.status(200).json({ success: true, donations: assignedDonations });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
exports.confirmDonation = async (req, res) => {
    try {
        const { id } = req.params;
        const donation = await Donation.findById(id);

        if (!donation) {
            return res.status(404).json({ success: false, message: "Donation not found" });
        }

        donation.status = "Completed";
        await donation.save();

        res.status(200).json({ success: true, message: "Donation marked as completed", donation });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to confirm donation", error: error.message });
    }
};


// @desc Get dashboard statistics
// @route GET /api/dashboard
// @access Admin / Volunteer
exports.getDashboardStats = async (req, res) => {
    try {
        // ✅ Fetch Total Assigned Donations
        const assignedDonations = await Donation.countDocuments({ status: { $ne: "rejected" } });

        // ✅ Fetch Total Pending Offers
        const pendingOffers = await Offer.countDocuments({ status: "unpaid" });

        // ✅ Fetch Donation Trends Over Time (Last 6 Months)
        const donationTrends = await getDonationTrends();

        // ✅ Fetch Offer Status Breakdown
        const offerBreakdown = await getOfferBreakdown();

        // ✅ Fetch Offers vs Donations
        const offersCount = await Offer.countDocuments();
        const donationsCount = await Donation.countDocuments();

        res.status(200).json({
            success: true,
            assignedDonations,
            pendingOffers,
            donationTrends,
            offerBreakdown,
            offersVsDonations: {
                offers: offersCount,
                donations: donationsCount,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// ✅ Helper Function: Donation Trends Over Last 6 Months
const getDonationTrends = async () => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - i);
        return {
            month: month.toLocaleString("default", { month: "short" }),
            count: 0,
        };
    }).reverse();

    const donations = await Donation.aggregate([
        {
            $group: {
                _id: { $month: "$date" },
                count: { $sum: 1 },
            },
        },
    ]);

    donations.forEach((donation) => {
        const index = last6Months.findIndex(m => new Date().getMonth() - m.month === donation._id);
        if (index !== -1) last6Months[index].count = donation.count;
    });

    return last6Months;
};

// ✅ Helper Function: Offer Status Breakdown
const getOfferBreakdown = async () => {
    const converted = await Offer.countDocuments({ status: "unpaid" });
    const pending = await Offer.countDocuments({ status: "paid" });
    const rejected = await Offer.countDocuments({ status: "Completed" });

    return {
        converted,
        pending,
        rejected,
    };
};
