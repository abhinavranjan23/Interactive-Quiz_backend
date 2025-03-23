const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res.status(401).json({ message: "Unauthorized, No Token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);

    if (!req.user) return res.status(401).json({ message: "User Not Found" });

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid Token" });
  }
};
module.exports = userAuth;
