const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Cart = require("../models/Cart");
const Grocery = require("../models/Grocery");
const Food = require("../models/Food");
const Medicine = require("../models/Medicine");
const Dairy = require("../models/Dairy");

const verifyToken = require("../middleware/authMiddleware");

// ==============================
// ✅ MODEL MAP
// ==============================
const MODEL_MAP = {
    Grocery,
    Food,
    Medicine,
    Dairy
};

const MAX_QTY = 10;

// ==============================
// ✅ HELPER
// ==============================
async function getOrCreateCart(userId) {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
        cart = await Cart.create({ userId, items: [] });
    }

    return cart;
}

// ==============================
// ✅ ADD TO CART (FINAL SAFE)
// ==============================
router.post("/add", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { productId, quantity = 1 } = req.body;

        // 🔥 Basic validation
        if (!productId || quantity <= 0) {
            return res.status(400).json({
                message: "productId and valid quantity required"
            });
        }

        if (quantity > MAX_QTY) {
            return res.status(400).json({
                message: `Max ${MAX_QTY} quantity allowed`
            });
        }

        let product = null;
        let mainCategory = null;

        for (const [categoryName, Model] of Object.entries(MODEL_MAP)) {
            const found = await Model.findById(productId).lean();
            if (found) {
                product = found;
                mainCategory = categoryName;
                break;
            }
        }

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (!product.isActive) {
            return res.status(400).json({ message: "Product disabled" });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                message: "Not enough stock available"
            });
        }

        const cart = await getOrCreateCart(userId);

        const index = cart.items.findIndex(
            item =>
                String(item.productId) === String(productId) &&
                item.category === mainCategory
        );

        if (index > -1) {
            const newQty = cart.items[index].quantity + quantity;

            if (newQty > MAX_QTY) {
                return res.status(400).json({
                    message: `Max ${MAX_QTY} quantity allowed per item`
                });
            }

            if (newQty > product.stock) {
                return res.status(400).json({
                    message: "Stock limit exceeded"
                });
            }

            cart.items[index].quantity = newQty;
            cart.items[index].price = product.price;
            cart.items[index].name = product.name;
            cart.items[index].imageUrl = product.imageUrl;
        } else {
            cart.items.push({
                productId,
                category: mainCategory,
                name: product.name,
                imageUrl: product.imageUrl,
                price: product.price,
                quantity,
                selected: true
            });
        }

        await cart.save();

        res.json({ message: "Item added", cart });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error adding to cart" });
    }
});

// ==============================
// ✅ GET CART (OPTIMIZED)
// ==============================
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.json({
                items: [],
                total: 0,
                selectedTotal: 0,
                removedItems: []
            });
        }

        const ALL_MODELS = [Grocery, Food, Medicine, Dairy];

        async function findProduct(productId) {
            for (let Model of ALL_MODELS) {
                const p = await Model.findById(productId).lean();
                if (p) return p;
            }
            return null;
        }

        const updatedItems = [];
        const removedItems = [];

        for (const item of cart.items) {
            const product = await findProduct(item.productId);

            if (!product) {
                removedItems.push({ name: item.name, reason: "deleted" });
                continue;
            }

            if (!product.isActive) {
                removedItems.push({ name: product.name, reason: "disabled" });
                continue;
            }

            if (product.stock <= 0) {
                removedItems.push({ name: product.name, reason: "out_of_stock" });
                continue;
            }

            let finalQty = Math.min(item.quantity, product.stock, MAX_QTY);

            if (finalQty !== item.quantity) {
                removedItems.push({
                    name: product.name,
                    reason: "quantity_adjusted",
                    oldQty: item.quantity,
                    newQty: finalQty
                });
            }

            updatedItems.push({
                ...item.toObject(),
                quantity: finalQty,
                price: product.price,
                name: product.name,
                imageUrl: product.imageUrl,
                selected: item.selected ?? true
            });
        }

        cart.items = updatedItems;
        await cart.save();

        let total = 0;
        let selectedTotal = 0;

        updatedItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            if (item.selected) {
                selectedTotal += itemTotal;
            }
        });

        res.json({
            items: updatedItems,
            total,
            selectedTotal,
            removedItems
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching cart" });
    }
});

// ==============================
// ✅ TOGGLE ITEM
// ==============================
router.put("/toggle/:itemId", verifyToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const item = cart.items.id(req.params.itemId);
        if (!item) return res.status(404).json({ message: "Item not found" });

        item.selected = !item.selected;

        await cart.save();

        res.json({ message: "Toggled" });

    } catch (err) {
        res.status(500).json({ message: "Error toggling" });
    }
});

// ==============================
// ✅ SELECT ALL
// ==============================
router.put("/select-all", verifyToken, async (req, res) => {
    try {
        const { selected } = req.body;

        const cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items.forEach(item => {
            item.selected = selected;
        });

        await cart.save();

        res.json({ message: "All items updated" });

    } catch (err) {
        res.status(500).json({ message: "Error updating" });
    }
});

// ==============================
// ✅ UPDATE QUANTITY (SAFE)
// ==============================
router.put("/update/:itemId", verifyToken, async (req, res) => {
    try {
        const { quantity } = req.body;

        if (!quantity || quantity < 1 || quantity > MAX_QTY) {
            return res.status(400).json({
                message: `Quantity must be between 1 and ${MAX_QTY}`
            });
        }

        const cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const item = cart.items.id(req.params.itemId);
        if (!item) return res.status(404).json({ message: "Item not found" });

        // 🔥 Check stock again
        const Model = MODEL_MAP[item.category];
        const product = await Model.findById(item.productId);

        if (!product || product.stock < quantity) {
            return res.status(400).json({
                message: "Stock not available"
            });
        }

        item.quantity = quantity;

        await cart.save();

        res.json({ message: "Updated", cart });

    } catch (err) {
        res.status(500).json({ message: "Error updating" });
    }
});

// ==============================
// ✅ REMOVE ITEM
// ==============================
router.delete("/remove/:itemId", verifyToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items.pull({ _id: req.params.itemId });

        await cart.save();

        res.json({ message: "Item removed", cart });

    } catch (err) {
        res.status(500).json({ message: "Error removing" });
    }
});

module.exports = router;