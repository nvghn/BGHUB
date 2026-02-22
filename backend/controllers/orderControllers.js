const Order = require("../models/Order");

// ============================
// @desc    Admin - Get all orders
// @route   GET /api/orders
// @access  Private (Admin)
// ============================
const getAllOrders = async (req, res) => {
    try {
            console.log("GET ALL ORDERS HIT");

                    const orders = await Order.find()
                                .populate("user", "name email role")
                                            .sort({ createdAt: -1 });

                                                    return res.status(200).json({
                                                                success: true,
                                                                            count: orders.length,
                                                                                        orders,
                                                                                                });
                                                                                                    } catch (error) {
                                                                                                            console.error("ORDER CONTROLLER ERROR:", error.message);
                                                                                                                    return res.status(500).json({ message: "Server error" });
                                                                                                                        }
                                                                                                                        };

                                                                                                                        module.exports = {
                                                                                                                            getAllOrders,
                                                                                                                            };