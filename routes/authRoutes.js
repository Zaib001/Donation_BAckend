const express = require('express');
const { registerAdmin, login, getUserProfile } = require('../controllers/authController');
const {protect} = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', login);
router.get('/profile', protect, getUserProfile);


module.exports = router;
