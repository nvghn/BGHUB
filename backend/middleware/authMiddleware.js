const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // 1️⃣ Check header
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res
                .status(401)
                .json({ message: "No token, authorization denied" });
        }

        // 2️⃣ Extract token
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Token missing" });
        }

        // 3️⃣ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: "Invalid token payload" });
        }

        // 4️⃣ Attach user
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        // 🔍 Proper debug (TEMPORARY)
        console.error("JWT ERROR:", error.message);

        return res.status(401).json({
            message:
                error.name === "TokenExpiredError"
                    ? "Token expired"
                    : "Token invalid",
        });
    }
};

module.exports = authMiddleware;