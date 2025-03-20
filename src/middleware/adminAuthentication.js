const jwt = require("jsonwebtoken");
require("dotenv").config();
const Admin = require("../models/adminSchema");

const adminAuthentication = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized  Access" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ error: "Unauthorized Access" });
    }
    req.admin = admin;
    next();
  } catch (err) {
    console.error("Authentication error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = adminAuthentication;
