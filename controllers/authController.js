const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateToken = require("../config/jwt"); // ✅ Import JWT generator

require('dotenv').config();
// @desc Register a new admin (Super Admin only)
// @route POST /api/auth/register
// @access Super Admin
exports.registerAdmin = async (req, res) => {

    const { name, email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword, role });

        res.status(201).json({ msg: 'User registered successfully', user });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
    

        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
          
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }
        const isPasswordMatch = await user.matchPassword(password);
        if (!isPasswordMatch) {
           
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

      
        res.status(200).json({
            success: true,
            message: "Login successful",
            token: generateToken(user),
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};



exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to fetch user profile' });
    }
};
exports.getEmployees = async (req, res) => {
    try {
        const employees = await User.find({ role: 'Employee' }).select('name email');
        res.status(200).json(employees);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to retrieve employees', error: err.message });
    }
};
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        await user.deleteOne();
        res.status(200).json({ msg: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Failed to delete user', error: err.message });
    }
};
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role } = req.body;

    try {
        let user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;

        await user.save();
        res.status(200).json({ msg: 'User updated successfully', user });
    } catch (err) {
        res.status(500).json({ msg: 'Failed to update user', error: err.message });
    }
};
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password from response
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to retrieve users', error: err.message });
    }
};
exports.getAllVolunteers = async (req, res) => {
    try {
        const volunteers = await User.find({ role: 'volunteer' }).select('-password');
        res.status(200).json({ success: true, volunteers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch volunteers', error: error.message });
    }
};
