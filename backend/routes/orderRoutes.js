const express = require("express");
const router = express.Router();

const Cart = require("../models/Cart");
const Order = require("../models/Order");
const User = require("../models/User");

const Grocery = require("../models/Grocery");
const Food = require("../models/Food");
const Medicine = require("../models/Medicine");
const Dairy = require("../models/Dairy");

const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

const MODEL_MAP = { Grocery, Food, Medicine, Dairy };

// 🔥 LIMIT
const MAX_QTY = 10;

// ============================
// PLACE ORDER (SMART OPTION B)
// ============================
router.post("/place", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { addressId, shipping, paymentMethod = "COD" } = req.body;

        // ============================
        // ADDRESS LOGIC
        // ============================
        let finalAddress;

        if (addressId) {
            const user = await User.findById(userId);
            const savedAddress = user.addresses.id(addressId);

            if (!savedAddress) {
                return res.status(400).json({ message: "Invalid addressId" });
            }

            finalAddress = savedAddress;
        } 
        else if (shipping) {
            const {
                fullName,
                phone,
                addressLine1,
                city,
                state,
                pincode
            } = shipping;

            if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
                return res.status(400).json({
                    message: "Complete delivery address required"
                });
            }

            finalAddress = shipping;
        } 
        else {
            return res.status(400).json({ message: "Address required" });
        }

        // ============================
        // CART FETCH
        // ============================
        const cart = await Cart.findOne({ userId });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart empty" });
        }

        const selectedItems = cart.items.filter(i => i.selected);

        if (selectedItems.length === 0) {
            return res.status(400).json({
                message: "No selected items to order"
            });
        }

        const itemsResolved = [];
        const adjustedItems = [];

        // ============================
        // VALIDATION + AUTO FIX
        // ============================
        for (const it of selectedItems) {
            const Model = MODEL_MAP[it.category];
            if (!Model) continue;

            const product = await Model.findById(it.productId);

            // ✅ COMBINED SAFETY CHECK
            if (!product || !product.isActive || product.stock <= 0) {
                adjustedItems.push({
                    name: it.name,
                    reason: "Unavailable / Out of stock"
                });
                continue;
            }

            // 🔥 FINAL SAFE QTY
            const finalQty = Math.min(it.quantity, product.stock, MAX_QTY);

            if (finalQty <= 0) continue;

            // Track quantity adjustment
            if (finalQty !== it.quantity) {
                adjustedItems.push({
                    name: product.name,
                    oldQty: it.quantity,
                    newQty: finalQty
                });
            }

            itemsResolved.push({
                productId: product._id,
                category: it.category,
                name: product.name,
                imageUrl: product.imageUrl,
                price: product.price,
                quantity: finalQty
            });
        }

        // 🚨 Prevent empty order
        if (itemsResolved.length === 0) {
            return res.status(400).json({
                message: "No valid items to order",
                adjustedItems
            });
        }

        // ============================
        // TOTAL
        // ============================
        const totalAmount = itemsResolved.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        // ============================
        // CREATE ORDER
        // ============================
        const order = await Order.create({
            user: userId,
            items: itemsResolved,
            shipping: finalAddress,
            paymentMethod,
            totalAmount,
            status: "processing"
        });

        // ============================
        // STOCK REDUCE
        // ============================
        for (const item of itemsResolved) {
            const Model = MODEL_MAP[item.category];

            await Model.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: -item.quantity } }
            );
        }

        // ============================
        // CLEAN CART
        // ============================
        cart.items = cart.items.filter(item => !item.selected);
        await cart.save();

        // ============================
        // RESPONSE
        // ============================
        res.status(201).json({
            message: "Order placed successfully",
            orderId: order._id,
            totalAmount,
            adjustedItems
        });

    } catch (err) {
        console.error("Order error:", err);
        res.status(500).json({ message: "Order error" });
    }
});

module.exports = router;