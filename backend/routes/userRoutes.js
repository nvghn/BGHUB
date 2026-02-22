const express = require("express");
const router = express.Router();

const User = require("../models/User");
const verifyToken = require("../middleware/authMiddleware");

const bcrypt = require("bcryptjs");

// ============================
// GET USER PROFILE
// ============================
router.get("/me", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Error fetching profile" });
    }
});

// ============================
// UPDATE USER PROFILE
// ============================
router.put("/update", verifyToken, async (req, res) => {
    try {
        const { name, phone } = req.body;

        const user = await User.findById(req.user.id);

        if (name) user.name = name;
        if (phone) user.phone = phone;

        await user.save();

        res.json({ message: "Profile updated", user });

    } catch (err) {
        res.status(500).json({ message: "Error updating profile" });
    }
});

// ============================
// CHANGE PASSWORD
// ============================
router.put("/change-password", verifyToken, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);

        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Old password incorrect" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({ message: "Password updated" });

    } catch (err) {
        res.status(500).json({ message: "Error changing password" });
    }
});

// ============================
// ADD ADDRESS
// ============================
router.post("/address", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        const newAddress = req.body;

        // If first address → default
        if (user.addresses.length === 0) {
            newAddress.isDefault = true;
        }

        user.addresses.push(newAddress);

        await user.save();

        res.json({
            message: "Address added",
            addresses: user.addresses
        });

    } catch (err) {
        res.status(500).json({ message: "Error adding address" });
    }
});

// ============================
// GET ALL ADDRESSES
// ============================
router.get("/address", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user.addresses);
    } catch (err) {
        res.status(500).json({ message: "Error fetching addresses" });
    }
});

// ============================
// UPDATE ADDRESS
// ============================
router.put("/address/:id", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        const address = user.addresses.id(req.params.id);

        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        Object.assign(address, req.body);

        await user.save();

        res.json({
            message: "Address updated",
            addresses: user.addresses
        });

    } catch (err) {
        res.status(500).json({ message: "Error updating address" });
    }
});

// ============================
// DELETE ADDRESS
// ============================
router.delete("/address/:id", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        user.addresses = user.addresses.filter(
            addr => addr._id.toString() !== req.params.id
        );

        await user.save();

        res.json({
            message: "Address deleted",
            addresses: user.addresses
        });

    } catch (err) {
        res.status(500).json({ message: "Error deleting address" });
    }
});

// ============================
// SET DEFAULT ADDRESS
// ============================
router.put("/address/default/:id", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        user.addresses.forEach(addr => {
            addr.isDefault = false;
        });

        const selected = user.addresses.id(req.params.id);

        if (!selected) {
            return res.status(404).json({ message: "Address not found" });
        }

        selected.isDefault = true;

        await user.save();

        res.json({
            message: "Default address set",
            addresses: user.addresses
        });

    } catch (err) {
        res.status(500).json({ message: "Error setting default address" });
    }
});

module.exports = router;