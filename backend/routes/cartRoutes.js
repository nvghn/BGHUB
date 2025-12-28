// backend/routes/cartRoutes.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Cart = require("../models/Cart");
const Grocery = require("../models/Grocery");
const Food = require("../models/Food");
const Medicine = require("../models/Medicine");
const Dairy = require("../models/Dairy");
const verifyToken = require("../middleware/authMiddleware");

const MODEL_MAP = {
    Grocery, Food, Medicine, Dairy
};

// helper: get or create cart
async function getOrCreateCart(userId) {
    let cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId, items: [] });
    return cart;
}

// POST /api/cart/add
router.post("/add", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { productId, quantity = 1, category } = req.body;

        if (!productId || !category || quantity <= 0) {
            return res.status(400).json({ message: "productId, category and quantity required" });
        }
        const Model = MODEL_MAP[category];
        if (!Model) return res.status(400).json({ message: "Invalid category" });

        const product = await Model.findById(productId).lean();
        if (!product) return res.status(404).json({ message: "Product not found" });

        const cart = await getOrCreateCart(userId);

        const idx = cart.items.findIndex(
            it => String(it.productId) === String(productId) && it.category === category
        );

        if (idx > -1) {
            cart.items[idx].quantity += quantity;
            // update snapshot price/name in case changed  
            cart.items[idx].price = product.price;
            cart.items[idx].name = product.name;
            cart.items[idx].imageUrl = product.imageUrl;
        } else {
            cart.items.push({
                productId,
                category,
                name: product.name,
                imageUrl: product.imageUrl,
                price: product.price,
                quantity
            });
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        console.error("Cart add error:", err);
        res.status(500).json({ message: "Error adding to cart" });
    }

});

// GET /api/cart
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.json({ items: [], total: 0 });

        // calculate total  
        const total = cart.items.reduce((s, it) => s + (it.price || 0) * it.quantity, 0);
        res.json({ items: cart.items, total });
    } catch (err) {
        console.error("Cart get error:", err);
        res.status(500).json({ message: "Error fetching cart" });
    }

});

// PUT /api/cart/update/:itemId  -> update quantity
router.put("/update/:itemId", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { quantity } = req.body;
        if (!quantity || quantity < 1) return res.status(400).json({ message: "Invalid quantity" });

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const item = cart.items.id(req.params.itemId);
        if (!item) return res.status(404).json({ message: "Item not found" });

        item.quantity = quantity;
        await cart.save();
        const total = cart.items.reduce((s, it) => s + (it.price || 0) * it.quantity, 0);
        res.json({ cart, total });
    } catch (err) {
        console.error("Cart update error:", err);
        res.status(500).json({ message: "Error updating cart" });
    }

});



// DELETE /api/cart/remove/:itemId
router.delete("/remove/:itemId", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found for this user" });
        }

        const itemId = new mongoose.Types.ObjectId(req.params.itemId);

        const exists = cart.items.some(
            item => item._id.equals(itemId)
        );

        if (!exists) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        cart.items.pull({ _id: itemId });
        await cart.save();

        const total = cart.items.reduce(
            (sum, it) => sum + it.price * it.quantity,
            0
        );

        res.json({
            message: "Item removed successfully",
            items: cart.items,
            total
        });

    } catch (err) {
        console.error("Cart remove error:", err);
        res.status(500).json({ message: "Error removing item from cart" });
    }
});

module.exports = router;