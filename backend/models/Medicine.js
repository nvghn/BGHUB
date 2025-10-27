const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
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
        enum: ["Tablet", "Syrup", "Ointment"],
        required: true
    }
});

module.exports = mongoose.model("Medicine", medicineSchema);