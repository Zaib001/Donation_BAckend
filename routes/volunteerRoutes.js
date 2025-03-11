const express = require('express');
const { addVolunteer, getVolunteers,downloadReceipt,getDashboardStats, updateVolunteer,getAssignedDonations,confirmDonation ,deleteVolunteer } = require('../controllers/volunteerController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/add', protect, adminOnly, addVolunteer);
router.get('/', getVolunteers);
router.get("/stats", protect, getDashboardStats);
router.get('/assigned/:volunteerId',protect, getAssignedDonations);
router.put('/confirm/:id',protect, confirmDonation);
router.put('/update/:id', protect, adminOnly, updateVolunteer);
router.delete('/delete/:id', protect, adminOnly, deleteVolunteer);
router.get("/receipt/:donationId", downloadReceipt);

module.exports = router;
