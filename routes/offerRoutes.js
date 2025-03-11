const express = require('express');
const {
    createOffer,
    getAllOffers,
    markOfferAsPaid,
    deleteOffer
} = require('../controllers/offerController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/create',protect, createOffer);
router.get('/', protect, getAllOffers);
router.put('/mark-paid/:id', protect, markOfferAsPaid);
router.delete('/delete/:id', protect, adminOnly, deleteOffer);

module.exports = router;
