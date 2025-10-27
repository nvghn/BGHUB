// backend/models/Cart.js
const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, required: true },
    category: { type: String, enum: ["Grocery", "Food", "Medicine", "Dairy"], required: true },
    name: { type: String },    // snapshot
    imageUrl: { type: String },// snapshot
    price: { type: Number },   // snapshot
    quantity: { type: Number, required: true, min: 1 }
}, { timestamps: true });

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [cartItemSchema]
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);