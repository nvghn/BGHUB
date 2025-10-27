const express = require("express");
const router = express.Router();
const Dairy = require("../models/Dairy");
const verifyToken = require("../middleware/authMiddleware");

// ✅ POST - Add Dairy Item
router.post("/add", verifyToken, async (req, res) => {
    const { name, price, imageUrl, stock, category } = req.body;

    if (!["Milk", "Ghee", "Sweet"].includes(category)) {
        return res.status(400).json({ message: "Invalid category. Use Milk, Ghee, or Sweet." });
    }

    try {
        const newItem = new Dairy({ name, price, imageUrl, stock, category });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ message: "Error adding dairy item" });
    }
});

// ✅ GET - All Items
router.get("/", async (req, res) => {
    try {
        const items = await Dairy.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: "Failed to load items" });
    }
});

// ✅ GET - Items by Category
router.get("/category/:type", async (req, res) => {
    const type = req.params.type;

    if (!["Milk", "Ghee", "Sweet"].includes(type)) {
        return res.status(400).json({ message: "Invalid category." });
    }

    try {
        const items = await Dairy.find({ category: type });
        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ message: "Failed to load items by category" });
    }
});

// ✅ DELETE
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const deleted = await Dairy.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Item not found" });
        res.json({ message: "Item deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting item" });
    }
});

// ✅ PUT - Update
router.put("/update/:id", verifyToken, async (req, res) => {
    const { name, price, imageUrl, stock, category } = req.body;

    if (!["Milk", "Ghee", "Sweet"].includes(category)) {
        return res.status(400).json({ message: "Invalid category." });
    }

    try {
        const updated = await Dairy.findByIdAndUpdate(
            req.params.id,
            { name, price, imageUrl, stock, category },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "Item not found" });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: "Error updating item" });
    }
});

module.exports = router;