const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    assignedDonations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Donation' }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Volunteer', VolunteerSchema);
