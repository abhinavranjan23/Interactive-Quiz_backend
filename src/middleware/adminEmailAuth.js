require("dotenv").config();
const Admin = require("../models/adminSchema");

const allowedAdminEmails = process.env.ALLOWED_ADMIN_EMAILS
  ? process.env.ALLOWED_ADMIN_EMAILS.split(",")
  : [];

const adminEmailAuth = async (req, res, next) => {
  const userEmail = req.body.email;
  const alreadyUser = await Admin.findOne({ email: userEmail });
  if (alreadyUser) {
    res.status(401).json({ message: "Email already in use" });
  }
  if (!userEmail) {
    return res.status(400).json({ error: "Email is required" });
  }

  if (!allowedAdminEmails.includes(userEmail)) {
    return res.status(403).json({ error: "Unauthorized: Email not allowed" });
  }

  next();
};

module.exports = adminEmailAuth;
