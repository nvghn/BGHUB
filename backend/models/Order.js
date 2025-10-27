// backend/models/Order.js
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, required: false },
    category: { type: String, enum: ["Grocery", "Food", "Medicine", "Dairy"], required: true },
    name: String,
    imageUrl: String,
    price: Number,
    quantity: { type: Number, required: true, min: 1 }
}, { _id: true });

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["processing", "delivered"], default: "processing" },
    shipping: {
        name: String,
        phone: String,
        line1: String,
        line2: String,
        city: String,
        state: String,
        pincode: String
    },
    paymentMethod: { type: String, default: "COD" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);