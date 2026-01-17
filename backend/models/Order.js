const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true
                },
                category: {
                    type: String,
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                imageUrl: String,
                price: {
                    type: Number,
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ],

        // 🔥 FIXED ADDRESS STRUCTURE
        shipping: {
            fullName: {
                type: String,
                required: true
            },
            phone: {
                type: String,
                required: true
            },
            addressLine1: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            pincode: {
                type: String,
                required: true
            },
            landmark: String,
            deliveryInstructions: String
        },

        paymentMethod: {
            type: String,
            default: "COD"
        },

        totalAmount: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: ["processing", "shipped", "delivered", "cancelled"],
            default: "processing"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);