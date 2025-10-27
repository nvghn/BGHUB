// backend/routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Grocery = require("../models/Grocery");
const Food = require("../models/Food");
const Medicine = require("../models/Medicine");
const Dairy = require("../models/Dairy");
const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

const MODEL_MAP = { Grocery, Food, Medicine, Dairy };

async function resolveItemSnapshot(it) {
    // if snapshot exists, prefer it
    if (it.name && it.price) return it;
    const Model = MODEL_MAP[it.category];
    if (!Model) return it;
    const p = await Model.findById(it.productId).lean();
    if (!p) return it;
    return {
        productId: p._id,
        category: it.category,
        name: p.name,
        imageUrl: p.imageUrl,
        price: p.price,
        quantity: it.quantity
    };
}

// POST /api/orders/place
router.post("/place", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { shipping = {}, paymentMethod = "COD" } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart || cart.items.length === 0) return res.status(400).json({ message: "Cart empty" });

        const itemsResolved = [];
        for (const it of cart.items) {
            const resolved = await resolveItemSnapshot(it);
            if (!resolved || !resolved.name || !resolved.price) {
                return res.status(400).json({ message: "Cannot resolve product details for cart item" });
            }
            itemsResolved.push({
                productId: resolved.productId || it.productId,
                category: resolved.category || it.category,
                name: resolved.name,
                imageUrl: resolved.imageUrl,
                price: resolved.price,
                quantity: it.quantity
            });
        }

        const totalAmount = itemsResolved.reduce((s, it) => s + it.price * it.quantity, 0);

        const order = await Order.create({
            user: userId,
            items: itemsResolved,
            totalAmount,
            shipping,
            paymentMethod,
            status: "processing"
        });

        // clear cart
        cart.items = [];
        await cart.save();

        res.status(201).json({ message: "Order placed", orderId: order._id, totalAmount });
    } catch (err) {
        console.error("Place order error:", err);
        res.status(500).json({ message: "Error placing order" });
    }
});

// GET /api/orders/my
router.get("/my", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error("My orders error:", err);
        res.status(500).json({ message: "Error fetching orders" });
    }
});

// Admin: GET all orders
router.get("/", verifyToken, isAdmin, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).populate("user", "name email");
        res.json(orders);
    } catch (err) {
        console.error("All orders error:", err);
        res.status(500).json({ message: "Error fetching orders" });
    }
});

// Admin: update order status
router.put("/:id/status", verifyToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!["processing", "delivered"].includes(status)) return res.status(400).json({ message: "Invalid status" });
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    } catch (err) {
        console.error("Order status error:", err);
        res.status(500).json({ message: "Error updating order status" });
    }
});

module.exports = router;