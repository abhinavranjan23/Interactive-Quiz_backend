require("dotenv").config();

const allowedAdminEmails = process.env.ALLOWED_ADMIN_EMAILS
  ? process.env.ALLOWED_ADMIN_EMAILS.split(",")
  : [];

const adminEmailAuth = (req, res, next) => {
  const userEmail = req.body.email;

  if (!userEmail) {
    return res.status(400).json({ error: "Email is required" });
  }

  if (!allowedAdminEmails.includes(userEmail)) {
    return res.status(403).json({ error: "Unauthorized: Email not allowed" });
  }

  next();
};

module.exports = adminEmailAuth;
