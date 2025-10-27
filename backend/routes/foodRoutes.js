const express = require("express");
const router = express.Router();
const Food = require("../models/Food");
const verifyToken = require("../middleware/authMiddleware");

const validCategories = ["Food", "Drinks", "Sweets"];

// ✅ Add
router.post("/add", verifyToken, async (req, res) => {
    const { name, price, imageUrl, stock, category } = req.body;

    if (!validCategories.includes(category)) {
        return res.status(400).json({ message: "Invalid category type" });
    }

    try {
        const newItem = new Food({ name, price, imageUrl, stock, category });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ message: "Error adding food item" });
    }
});

// ✅ All Items
router.get("/", async (req, res) => {
    try {
        const items = await Food.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: "Failed to load items" });
    }
});

// ✅ By Category
router.get("/category/:type", async (req, res) => {
    const categoryType = req.params.type;

    if (!validCategories.includes(categoryType)) {
        return res.status(400).json({ message: "Invalid category type" });
    }

    try {
        const items = await Food.find({ category: categoryType });
        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ message: "Failed to load items by category" });
    }
});

// ✅ Delete
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const deleted = await Food.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Item not found" });
        res.json({ message: "Item deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting item" });
    }
});

// ✅ Update
router.put("/update/:id", verifyToken, async (req, res) => {
    const { name, price, imageUrl, stock, category } = req.body;

    if (!validCategories.includes(category)) {
        return res.status(400).json({ message: "Invalid category. Use Food, Drinks, or Sweets." });
    }

    try {
        const updatedItem = await Food.findByIdAndUpdate(
            req.params.id,
            { name, price, imageUrl, stock, category },
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.json(updatedItem);
    } catch (err) {
        res.status(500).json({ message: "Error updating item" });
    }
});

module.exports = router;