const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
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
        category: {
                type: String,
                enum: ["Food", "Drinks", "Sweets"],
                required: true
        }
});

module.exports = mongoose.model("Food", foodSchema);