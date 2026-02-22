const mongoose = require("mongoose");

// 📦 ADDRESS SUB-SCHEMA
const addressSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        addressLine1: { type: String, required: true },
        addressLine2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        landmark: { type: String },
        deliveryInstructions: { type: String },
        isDefault: { type: Boolean, default: false }
    },
    { _id: true }
);

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        phone: {
            type: String
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        // 🔥 NEW FEATURE
        addresses: [addressSchema]
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);