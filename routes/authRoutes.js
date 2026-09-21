const express = require("express");
const User = require("../models/User");

const router = express.Router();




// =====================================================
// API 1 - Register User
// POST /api/auth/register
// =====================================================

router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Name, email and password are required"
        });
    }

    try {
        // Check if email already exists in MongoDB
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Create new user in MongoDB
        const newUser = await User.create({
            name: name,
            email: email,
            password: password
        });

        // Send response
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error("Registration error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


// =====================================================
// API 2 - Login User
// POST /api/auth/login
// =====================================================

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    try {
        // Find user in MongoDB
        const user = await User.findOne({ email });

        // User not found
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check password
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Login successful
        res.json({
    success: true,
    message: "Login successful",
    user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    }
});

    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


// =====================================================
// API 20 - Get User Profile
// GET /api/auth/profile/:id
// =====================================================

router.get("/profile/:id", async (req, res) => {
    const userId = req.params.id;

    try {
        // Find user in MongoDB
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Get profile error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


// =====================================================
// API 21 - Update User Profile
// PUT /api/auth/profile/:id
// =====================================================

router.put("/profile/:id", async (req, res) => {
    const userId = req.params.id;
    const { name, email } = req.body;

    // Check required fields
    if (!name || !email) {
        return res.status(400).json({
            success: false,
            message: "Name and email are required"
        });
    }

    try {
        // Find and update user in MongoDB
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                name: name,
                email: email
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email
            }
        });

    } catch (error) {
        console.error("Update profile error:", error.message);

        // Handle duplicate email
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


module.exports = router;