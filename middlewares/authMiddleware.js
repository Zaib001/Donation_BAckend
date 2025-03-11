const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ success: false, message: "Unauthorized access" });
            }

            next();
        } catch (error) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
    } else {
        return res.status(401).json({ success: false, message: "No token provided" });
    }
};

// Middleware to check if the user is an admin
const adminOnly = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }
    next();
};

module.exports = { protect, adminOnly };
