const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    category: {
        type: String,
        enum: ["Grocery", "Food", "Medicine", "Dairy"],
        required: true
    },
    name: String,
    imageUrl: String,
    price: Number,
    quantity: {
        type: Number,
        required: true,
        min: 1
    },

    // 🔥 NEW
    selected: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        items: [cartItemSchema]
    },
    { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);