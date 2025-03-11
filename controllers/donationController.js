const Donation = require('../models/Donation');
const Volunteer = require('../models/Volunteer');
const mongoose = require("mongoose");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// @desc Generate and download donation receipt
// @route GET /api/donations/receipt/:donationId
// @access Protected
exports.downloadReceipt = async (req, res) => {
    try {
        const { donationId } = req.params;

        // Fetch donation details
        const donation = await Donation.findById(donationId)
            .populate("donor", "name email")
            .populate("volunteer", "name");

        if (!donation) {
            return res.status(404).json({ success: false, message: "Donation not found" });
        }

        // Generate Receipt PDF
        const doc = new PDFDocument();
        const filePath = path.join(__dirname, `../receipts/receipt-${donationId}.pdf`);
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // ✅ Add Receipt Content
        doc.fontSize(20).text("Donation Receipt", { align: "center" });
        doc.moveDown();
        doc.fontSize(14).text(`Receipt ID: ${donation._id}`);
        doc.text(`Donor Name: ${donation.donor?.name || "Anonymous"}`);
        doc.text(`Email: ${donation.donor?.email || "N/A"}`);
        doc.text(`Amount: ₹${donation.amount}`);
        doc.text(`Payment Method: ${donation.paymentMethod}`);
        doc.text(`Transaction ID: ${donation.transactionId || "N/A"}`);
        doc.text(`Cause: ${donation.cause}`);
        doc.text(`Volunteer: ${donation.volunteer?.name || "N/A"}`);
        doc.text(`Date: ${new Date(donation.createdAt).toLocaleString()}`);
        doc.moveDown();
        doc.text("Thank you for your generous support!", { align: "center" });

        // Finalize PDF
        doc.end();

        // Send the receipt file as response
        writeStream.on("finish", () => {
            res.download(filePath, `Donation-Receipt-${donationId}.pdf`, (err) => {
                if (err) console.error("Error downloading file:", err);
                fs.unlinkSync(filePath); // Delete file after download
            });
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

exports.createDonationLogin = async (req, res) => {
    try {

        const { donorName, amount, cause,whatsapp, paymentMethod, transactionId, volunteerName } = req.body;

        // Validate request fields
        if (!donorName || !amount || !cause || !paymentMethod) {
            console.error("❌ Missing required fields");
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        const volunteer = await Volunteer.findOne({ name: volunteerName });
        if (!volunteer) {
            console.error("❌ Volunteer not found:", volunteerName);
            return res.status(404).json({ success: false, message: "Volunteer not found." });
        }

        const donation = await Donation.create({
            donor: req.user.id,
            donorName,
            amount,
            cause,
            whatsapp,
            paymentMethod,
            transactionId,
            volunteer: volunteer._id,
            status: paymentMethod === 'Razorpay' ? 'approved' : 'pending'
        });

        res.status(201).json({
            success: true,
            message: "Donation created successfully",
            donation
        });
    } catch (error) {
        console.error("❌ Internal Server Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
exports.createDonation = async (req, res) => {
    try {

        const { donorName, amount, cause, paymentMethod, transactionId, volunteerName,whatsapp } = req.body;

        // Validate request fields
        if (!donorName || !amount || !cause || !paymentMethod || !whatsapp) {
            console.error("❌ Missing required fields");
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        const volunteer = await Volunteer.findOne({ name: volunteerName });
        if (!volunteer) {
            console.error("❌ Volunteer not found:", volunteerName);
            return res.status(404).json({ success: false, message: "Volunteer not found." });
        }

        const donation = await Donation.create({
            donorName,
            amount,
            whatsapp,
            cause,
            paymentMethod,
            transactionId,
            volunteer: volunteer._id, 
            status: paymentMethod === 'Razorpay' ? 'approved' : 'pending'
        });

        res.status(201).json({
            success: true,
            message: "Donation created successfully",
            donation
        });
    } catch (error) {
        console.error("❌ Internal Server Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// @desc Get all donations
// @route GET /api/donations
// @access Admin
exports.getAllDonations = async (req, res) => {
    try {
        const donations = await Donation.find().populate('donor', 'name email').populate('volunteer', 'name');
        console.log(donations)
        res.status(200).json({ success: true, donations });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

exports.getDonationsByDonor = async (req, res) => {
    try {
        const donorId = req.user.id; // Extract donor ID from the authenticated user

        if (!mongoose.Types.ObjectId.isValid(donorId)) {
            return res.status(400).json({ success: false, message: "Invalid donor ID" });
        }

        const donations = await Donation.find({ donor: new mongoose.Types.ObjectId(donorId) })
            .populate('donor', 'name email')
            .populate('volunteer', 'name');

        if (!donations.length) {
            return res.status(404).json({ success: false, message: "No donations found for this donor" });
        }

        res.status(200).json({ success: true, donations });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};


// @desc Get a single donation by ID
// @route GET /api/donations/:id
// @access Admin/Volunteer
exports.getDonationById = async (req, res) => {
    try {
        const { id } = req.params;

        const donation = await Donation.findById(id).populate('donor', 'name email').populate('volunteer', 'name');
        if (!donation) {
            return res.status(404).json({ success: false, message: "Donation not found" });
        }

        res.status(200).json({ success: true, donation });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
// @desc Update donation status (Pending → Approved)
// @route PUT /api/donations/update/:id
// @access Admin
exports.updateDonationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        const donation = await Donation.findById(id).populate('donor', 'whatsapp');

        if (!donation) {
            return res.status(404).json({ success: false, message: "Donation not found" });
        }

        donation.status = status;
        await donation.save();
      

        res.status(200).json({ success: true, message: "Donation status updated successfully", donation });

    } catch (error) {
        console.error("Donation Update Error:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};



// @desc Delete a donation
// @route DELETE /api/donations/delete/:id
// @access Admin
exports.deleteDonation = async (req, res) => {
    try {
        const { id } = req.params;

        const donation = await Donation.findById(id);
        if (!donation) {
            return res.status(404).json({ success: false, message: "Donation not found" });
        }

        await donation.deleteOne();
        res.status(200).json({ success: true, message: "Donation deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
