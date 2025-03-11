const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role }, 
        process.env.JWT_SECRET || "your_secret_key", // Use environment variables for security
        { expiresIn: "7d" } // Token expiration
    );
};

module.exports = generateToken;
