const User = require("../models/userSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const express = require("express");
const userRoute = express.Router();
const validateUserSignup = require("../utils/validateUserSignup");
const userAuth = require("../middleware/userAuthentication");
const Leaderboard = require("../models/leaderBoardSchema");
const updateLeaderboardRanks = require("../utils/updateLeaderBoard");
const updateUserQuizAttempt = require("../utils/updateUserQuizes");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

userRoute.post("/user/signup", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      age,
      city,
      state,
      country,
      imageUrl,
      socialLogin,
    } = req.body;
    const { isValid, errors } = validateUserSignup({
      firstName,
      lastName,
      email,
      password,
      age,
      city,
      state,
      country,
      imageUrl,
    });
    if (!isValid) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    user = await User.create({
      firstName,
      lastName,
      email,
      password,
      age,
      city,
      state,
      country,
      imageUrl,
      socialLogin,
    });

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

userRoute.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    await user.updateLastLogin();

    const token = generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.json({ message: "Login successful", user: user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

userRoute.post("/user/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});
userRoute.get("/user/profile", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("quizAttempts.quizId", "title topic");
    if (!user) return res.status(404).json({ message: "User not  " });

    res.json({ user: user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

userRoute.put("/user/update-profile", userAuth, async (req, res) => {
  try {
    const { firstName, lastName, age, city, state, country, imageUrl } =
      req.body;
    const allowedFields = [
      "firstName",
      "lastName",
      "age",
      "city",
      "state",
      "country",
      "imageUrl",
      "socialLogin",
    ];

    const receivedFields = Object.keys(req.body);
    const isAllowed = receivedFields.every((field) =>
      allowedFields.includes(field)
    );

    if (!isAllowed) {
      return res.status(400).json({ message: "Invalid fields in request" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { firstName, lastName, age, city, state, country, imageUrl, socialLogin },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

userRoute.put("/user/update-password", userAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Old password is incorrect" });
    const { isValid, errors } = validateUserSignup(newPassword);
    if (!isValid) {
      return res.status(400).json({ message: "Validation failed", errors });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

userRoute.post("/user/update-score/:quizId", userAuth, async (req, res) => {
  try {
    const score = req.body.newScore;
    const quizId = req.params.quizId;
    const userId = req.user._id;
    if (!userId || !quizId || score === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    let leaderboardEntry = await Leaderboard.findOne({ user: userId });

    if (!leaderboardEntry) {
      leaderboardEntry = await Leaderboard.create({
        user: userId,
        totalScore: score,
        quizAttempted: 1,
      });
    } else {
      leaderboardEntry.totalScore += score;
      leaderboardEntry.quizAttempted += 1;
      await leaderboardEntry.save();
    }

    await updateLeaderboardRanks();
    const result = await updateUserQuizAttempt(userId, quizId, score);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = userRoute;
