const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    cause: { type: String, required: true },
    whatsapp: { type: String,required: true },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer', required: true },
    status: { type: String, enum: ['unpaid', 'paid','Completed'], default: 'unpaid' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Offer', OfferSchema);
