const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

dotenv.config();
const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Rate Limiter (API protection)
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // max 30 requests per IP
    message: {
        message: "Too many requests, please try again later"
    }
});

// Apply limiter to all API routes
app.use("/api/", limiter);

// ✅ Routes
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const groceryRoutes = require("./routes/groceryRoutes");
const foodRoutes = require("./routes/foodRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const dairyRoutes = require("./routes/dairyRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminCategoryRoutes = require("./routes/adminCategoryRoutes");
const userRoutes = require("./routes/userRoutes");

// Route Mounting
app.use("/api/user", userRoutes);
app.use("/api/admin", adminCategoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/groceries", groceryRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/dairy", dairyRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// ✅ Health Check Route (optional but useful)
app.get("/", (req, res) => {
    res.send("API is running 🚀");
});

// ✅ Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected ✅");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} 🚀`);
        });
    })
    .catch((err) => {
        console.log("DB Error ❌", err);
    });