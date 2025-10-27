const mongoose = require("mongoose");

const grocerySchema = new mongoose.Schema({
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
        enum: ["Fruit", "Vegetable", "Grain"],
        required: true
    }
});

module.exports = mongoose.model("Grocery", grocerySchema);