const express = require("express");
const router = express.Router();

const { getDashboardStats } = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware"); 
const isAdmin = require("../middleware/isAdmin");

router.get("/dashboard", authMiddleware, isAdmin, getDashboardStats);

module.exports = router;