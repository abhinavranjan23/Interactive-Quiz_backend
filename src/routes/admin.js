const express = require("express");
const adminRouter = express.Router();
const adminEmailAuth = require("../middleware/adminEmailAuth.js");
const Admin = require("../models/adminSchema.js");
const validateSignup = require("../utils/ValidateSignup.js");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminAuthentication = require("../middleware/adminAuthentication.js");
const validateQuiz = require("../utils/validateQuiz.js");
const Quiz = require("../models/quizeSchema.js");

adminRouter.post("/admin/signup", adminEmailAuth, async (req, res) => {
  try {
    const { email, password, name, photoUrl } = req.body;
    if (!email || !password || !name || !photoUrl) {
      return res.status(400).json({ error: "Please enter all fields" });
    }
    const { isValid, errors } = validateSignup({ email, password, name });
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newAdmin = new Admin({
      email,
      password: hashedPassword,
      name,
      photoUrl,
    });
    await newAdmin.save();
    const token = jwt.sign({ id: newAdmin._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Required for SameSite=None
      sameSite: "None",
    });
    res.status(201).json({ message: "Admin created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
adminRouter.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    if (!email || !password) {
      return res.status(400).json({ error: "Please enter all fields" });
    }
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const isMatch = bcrypt.compareSync(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Required for SameSite=None
      sameSite: "None",
    });
    res
      .status(200)
      .json({ message: "Admin logged in successfully", admin: admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
adminRouter.post("/admin/logout", adminAuthentication, async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Admin logged out successfully" });
});
adminRouter.get("/admin/me", adminAuthentication, async (req, res) => {
  res.status(200).json({ admin: req.admin });
});
adminRouter.post(
  "/admin/add/quizzes",
  adminAuthentication,
  async (req, res) => {
    try {
      const {
        title,
        titleImage,
        isTrending,
        topic,
        type,
        questions,
        totalScore,
        maxDuration,
      } = req.body;

      if (
        !title ||
        !topic ||
        !type ||
        !questions ||
        !totalScore ||
        !maxDuration
      ) {
        return res
          .status(400)
          .json({ error: "Please provide all required fields" });
      }

      if (!Array.isArray(questions) || questions.length === 0) {
        return res
          .status(400)
          .json({ error: "Questions should be a non-empty array" });
      }

      const { isValid, errors } = validateQuiz({
        title,
        titleImage,
        topic,
        type,
        questions,
        totalScore,
        maxDuration,
      });
      if (!isValid) {
        return res.status(400).json(errors);
      }

      const calculatedScore = questions.reduce(
        (sum, question) => sum + question.score,
        0
      );
      if (calculatedScore !== totalScore) {
        return res.status(400).json({
          error: "Total score does not match the sum of question scores",
        });
      }

      const newQuiz = new Quiz({
        title,
        titleImage,
        isTrending,
        topic,
        type,
        questions,
        maxDuration,
      });
      await newQuiz.save();

      res
        .status(201)
        .json({ message: "Quiz added successfully", quiz: newQuiz });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
adminRouter.put(
  "/admin/update/quizzes/:id",
  adminAuthentication,
  async (req, res) => {
    console.log(req.params.id);
    try {
      const { isTrending } = req.body;
      console.log(typeof isTrending);
      if (typeof isTrending !== "boolean") {
        return res
          .status(400)
          .json({ error: "isTrending must be a boolean value" });
      }

      const quiz = await Quiz.findById(req.params.id);
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      quiz.isTrending = isTrending;
      await quiz.save();

      res.status(200).json({ message: "Quiz updated successfully", quiz });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
module.exports = adminRouter;
