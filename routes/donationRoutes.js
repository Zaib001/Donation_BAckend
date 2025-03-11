const express = require('express');
const {
    createDonation,
    getAllDonations,
    getDonationById,
    updateDonationStatus,
    deleteDonation,
    createDonationLogin,
    getDonationsByDonor,downloadReceipt
} = require('../controllers/donationController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, adminOnly, getAllDonations);
router.get('/donor', protect, getDonationsByDonor);
router.get("/receipt/:donationId", protect, downloadReceipt);
router.post('/create', createDonation);
router.post('/createlogin',protect, createDonationLogin);
router.get('/:id', protect, getDonationById);
router.put('/update/:id', protect, adminOnly, updateDonationStatus);
router.delete('/delete/:id', protect, adminOnly, deleteDonation);

module.exports = router;
