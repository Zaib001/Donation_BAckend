const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    donorName: { type: String, required: true },  
    amount: { type: Number, required: true },
    cause: { type: String, required: true },
    whatsapp: { type: String },
    paymentMethod: { type: String, enum: ['Razorpay', 'GPay', 'Cash','Bank Transfer', 'by_hand'], required: true },
    transactionId: { type: String, default: null },
    status: { type: String, enum: ['pending', 'approved', 'rejected','Completed'], default: 'pending' },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donation', DonationSchema);
