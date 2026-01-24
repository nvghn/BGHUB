const express = require("express");
const router = express.Router();
const Grocery = require("../models/Grocery");
const Food = require("../models/Food");
const Dairy = require("../models/Dairy");
const Medicine = require("../models/Medicine");
const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

const MODEL_MAP = {
    Grocery,
    Food,
    Dairy,
    Medicine
};

// PUT /api/admin/category/:category/enable-disable
router.put(
    "/category/:category/enable-disable",
    verifyToken,
    isAdmin,
    async (req, res) => {
        try {
            const { category } = req.params;
            const { isActive } = req.body;

            const Model = MODEL_MAP[category];
            if (!Model) {
                return res.status(400).json({ message: "Invalid category" });
            }

            await Model.updateMany({}, { isActive });

            res.json({
                message: `${category} category ${isActive ? "enabled" : "disabled"
                    } successfully`
            });
        } catch (err) {
            console.error("Category toggle error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }
);

module.exports = router;