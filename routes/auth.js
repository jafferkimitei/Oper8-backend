
const express = require('express');

const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();



router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        console.log("Trying to log in with email:", email)
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found");
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        console.log("User found:", user);
        console.log("Password provided:", password);
        console.log("Stored password hash:", user.password);

        // var thispassword = await bcrypt.hash(password, 10);
        // console.log("Password provided:", thispassword);

        // Check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", isMatch);
        if (!isMatch) {
            console.log("Password does not match");
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWTSTUFF, {
            expiresIn: '1h', 
        });

        res.status(200).json({ message: 'Login successful', token, user: { id: user._id, name: user.name, role: user.role } });
    } catch (error) {
        console.error("Error during login:", error.stack);
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
