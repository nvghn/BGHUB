const express = require("express");
const router = express.Router();
const Medicine = require("../models/Medicine");
const verifyToken = require("../middleware/authMiddleware");

// ✅ POST - Add Medicine
router.post("/add", verifyToken, async (req, res) => {
    const { name, price, imageUrl, stock, category } = req.body;

    if (!["Tablet", "Syrup", "Ointment"].includes(category)) {
        return res.status(400).json({ message: "Invalid category. Use Tablet, Syrup, or Ointment." });
    }

    try {
        const newItem = new Medicine({ name, price, imageUrl, stock, category });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ message: "Error adding medicine item" });
    }
});

// ✅ GET - All Medicines
router.get("/", async (req, res) => {
    try {
        const items = await Medicine.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: "Failed to load medicine items" });
    }
});

// ✅ GET - By Category
router.get("/category/:type", async (req, res) => {
    const categoryType = req.params.type;

    if (!["Tablet", "Syrup", "Ointment"].includes(categoryType)) {
        return res.status(400).json({ message: "Invalid category type" });
    }

    try {
        const items = await Medicine.find({ category: categoryType });
        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ message: "Failed to load items by category" });
    }
});

// ✅ PUT - Update
router.put("/update/:id", verifyToken, async (req, res) => {
    const { name, price, imageUrl, stock, category } = req.body;

    if (!["Tablet", "Syrup", "Ointment"].includes(category)) {
        return res.status(400).json({ message: "Invalid category type" });
    }

    try {
        const updatedItem = await Medicine.findByIdAndUpdate(
            req.params.id,
            { name, price, imageUrl, stock, category },
            { new: true }
        );

        if (!updatedItem) return res.status(404).json({ message: "Item not found" });

        res.json(updatedItem);
    } catch (err) {
        res.status(500).json({ message: "Error updating medicine item" });
    }
});

// ✅ DELETE - Remove
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const deleted = await Medicine.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Item not found" });
        res.json({ message: "Item deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting item" });
    }
});

module.exports = router;