const mongoose = require("mongoose");

const dairySchema = new mongoose.Schema({
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
        enum: ["Milk", "Ghee", "Sweet"],
        required: true
    }
});

module.exports = mongoose.model("Dairy", dairySchema);