const express = require("express");
const router = express.Router();

const Food = require("../models/Food");
const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

const ALL_CATEGORIES = ["Grocery", "Food", "Dairy", "Medicine"];
const validCategories = ["Food", "Drinks", "Sweets"];


// ----------------------
// USER ROUTES
// ----------------------

// ✅ GET - All ACTIVE products
router.get("/", async (req, res) => {
    try {
        const products = await Food.find({ isActive: true });

        if (products.length === 0) {
            const suggest = ALL_CATEGORIES.filter(c => c !== "Food");

            return res.status(200).json({
                message: "No products available in Food",
                suggest,
                items: []
            });
        }

        res.json({ items: products });

    } catch (err) {
        console.error("Food fetch error:", err);
        res.status(500).json({ message: "Server error" });
    }
});


// ✅ GET - Single item
router.get("/:id", async (req, res) => {
    try {
        const item = await Food.findById(req.params.id);

        if (!item || !item.isActive) {
            return res.status(404).json({ message: "Item not found or disabled" });
        }

        res.json(item);

    } catch (err) {
        res.status(500).json({ message: "Error fetching item" });
    }
});


// ✅ GET - By Category
router.get("/category/:type", async (req, res) => {
    const categoryType = req.params.type;

    if (!validCategories.includes(categoryType)) {
        return res.status(400).json({ message: "Invalid category type" });
    }

    try {
        const items = await Food.find({
            category: categoryType,
            isActive: true
        });

        if (items.length === 0) {
            const suggest = ALL_CATEGORIES.filter(c => c !== "Food");

            return res.json({
                message: `No ${categoryType} items available`,
                suggest,
                items: []
            });
        }

        res.json({ items });

    } catch (err) {
        res.status(500).json({ message: "Failed to load items by category" });
    }
});


// ----------------------
// ADMIN ROUTES
// ----------------------

// ✅ POST - Add item
router.post("/add", verifyToken, isAdmin, async (req, res) => {
    const { name, price, imageUrl, stock, category } = req.body;

    if (!validCategories.includes(category)) {
        return res.status(400).json({ message: "Invalid category type" });
    }

    try {
        const newItem = new Food({
            name,
            price,
            imageUrl,
            stock,
            category,
            isActive: true
        });

        await newItem.save();
        res.status(201).json(newItem);

    } catch (err) {
        res.status(500).json({ message: "Error adding food item" });
    }
});


// ✅ PUT - Update item
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
    const { name, price, imageUrl, stock, category, isActive } = req.body;

    if (category && !validCategories.includes(category)) {
        return res.status(400).json({ message: "Invalid category type" });
    }

    try {
        const updated = await Food.findByIdAndUpdate(
            req.params.id,
            { name, price, imageUrl, stock, category, isActive },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.json(updated);

    } catch (err) {
        res.status(500).json({ message: "Error updating item" });
    }
});


// ✅ DELETE - Remove item
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const deleted = await Food.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.json({ message: "Item deleted" });

    } catch (err) {
        res.status(500).json({ message: "Error deleting item" });
    }
});

module.exports = router;