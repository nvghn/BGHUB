const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const groceryRoutes = require("./routes/groceryRoutes");
const foodRoutes = require("./routes/foodRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const dairyRoutes = require("./routes/dairyRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");


app.use("/api/auth", authRoutes);
app.use("/api/groceries", groceryRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/dairy", dairyRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        app.listen(process.env.PORT || 5000, () => {
            console.log(`Server running on port ${process.env.PORT || 5000}`);
        });
    })
    .catch((err) => console.log(err));