const express = require("express");
const router = express.Router();
const Grocery = require("../models/Grocery");
const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

// ----------------------
// USER ROUTES
// ----------------------

// ✅ GET - Single item by ID
router.get("/:id", async (req, res) => {
    try {
            const item = await Grocery.findById(req.params.id);
                    if (!item) {
                                return res.status(404).json({ message: "Item not found" });
                                        }
                                                res.json(item);
                                                    } catch (err) {
                                                            res.status(500).json({ message: "Error fetching item" });
                                                                }
                                                                });

// ✅ GET - All items
router.get("/", async (req, res) => {
    try {
        const items = await Grocery.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: "Failed to load items" });
    }
});

// ✅ GET - By Category
router.get("/category/:type", async (req, res) => {
    const categoryType = req.params.type;

    if (!["Fruit", "Vegetable", "Grain"].includes(categoryType)) {
        return res.status(400).json({ message: "Invalid category type" });
    }

    try {
        const items = await Grocery.find({ category: categoryType });
        res.status(200).json(items);
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

    if (!["Fruit", "Vegetable", "Grain"].includes(category)) {
        return res.status(400).json({ message: "Invalid category type" });
    }

    try {
        const newItem = new Grocery({ name, price, imageUrl, stock, category });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ message: "Error adding grocery item" });
    }
});

// ✅ PUT - Update item
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
    const { name, price, imageUrl, stock, category } = req.body;

    if (category && !["Fruit", "Vegetable", "Grain"].includes(category)) {
        return res.status(400).json({ message: "Invalid category type" });
    }

    try {
        const updated = await Grocery.findByIdAndUpdate(
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

// ✅ DELETE - Remove item
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const deleted = await Grocery.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Item not found" });
        res.json({ message: "Item deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting item" });
    }
});

module.exports = router;