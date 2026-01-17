const User = require("../models/User");
const Order = require("../models/Order");

exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();

        const pendingOrders = await Order.countDocuments({ orderStatus: "Pending" });
        const deliveredOrders = await Order.countDocuments({ orderStatus: "Delivered" });

        const revenueData = await Order.aggregate([
            { $match: { isPaid: true } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalPrice" },
                },
            },
        ]);

        const totalRevenue =
            revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalOrders,
                pendingOrders,
                deliveredOrders,
                totalRevenue,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Dashboard data fetch failed",
            error: error.message,
        });
    }
};