const mongoose = require("mongoose");

const grocerySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true
        },

        imageUrl: {
            type: String,
            required: true
        },

        stock: {
            type: Number,
            required: true
        },

        // 🟢 Product sub-category (Fruit / Vegetable etc.)
        category: {
            type: String,
            enum: ["Fruit", "Vegetable", "Grain"],
            required: true
        },

        // 🔴 MAIN ENABLE / DISABLE FLAG (ADMIN CONTROL)
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Grocery", grocerySchema);