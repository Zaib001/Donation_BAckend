const express = require('express');
const { registerAdmin, login, getUserProfile,getAllVolunteers } = require('../controllers/authController');
const {protect} = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', login);
router.get('/profile', protect, getUserProfile);
router.get("/volunteers", getAllVolunteers);

module.exports = router;
