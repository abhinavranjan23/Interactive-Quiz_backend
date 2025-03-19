const express = require("express");
const app = express();
const connectDB = require("./config/database.js");
const adminEmailAuth = require("./middleware/adminEmailAuth.js");
const Admin = require("./models/adminSchema.js");
const validateSignup = require("./utils/ValidateSignup.js");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const adminAuthentication = require("./middleware/adminAuthentication.js");
const validateQuiz = require("./utils/validateQuiz.js");
const Quiz = require("./models/quizeSchema.js");
app.use(express.json()); // JSON body parsing
app.use(cookieParser()); // Cookie parsing

app.post("/admin/signup", adminEmailAuth, async (req, res) => {
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
    res.cookie("token", token);
    res.status(201).json({ message: "Admin created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
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
    res.cookie("token", token);
    res.status(200).json({ message: "Admin logged in successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/admin/logout", adminAuthentication, async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Admin logged out successfully" });
});

app.post("/admin/add/quizzes", adminAuthentication, async (req, res) => {
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

    res.status(201).json({ message: "Quiz added successfully", quiz: newQuiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/admin/update/quizzes/:id", adminAuthentication, async (req, res) => {
  try {
    const { isTrending } = req.body;
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
});
app.get("/quizzes/trending", async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const limitValue = parseInt(limit, 10);
    const pageValue = parseInt(page, 10);

    if (
      isNaN(limitValue) ||
      isNaN(pageValue) ||
      limitValue <= 0 ||
      pageValue <= 0
    ) {
      return res.status(400).json({ error: "Invalid limit or page value" });
    }

    const trendingQuizzes = await Quiz.find({ isTrending: true })
      .skip((pageValue - 1) * limitValue)
      .limit(limitValue);

    res.status(200).json({ quizzes: trendingQuizzes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/quizzes", async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const limitValue = parseInt(limit, 10);
    const pageValue = parseInt(page, 10);

    if (
      isNaN(limitValue) ||
      isNaN(pageValue) ||
      limitValue <= 0 ||
      pageValue <= 0
    ) {
      return res.status(400).json({ error: "Invalid limit or page value" });
    }

    const quizzes = await Quiz.find()
      .skip((pageValue - 1) * limitValue)
      .limit(limitValue);

    res.status(200).json({ quizzes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.use("/", (req, res, err) => {
  //
  if (err) {
    res.status(500).json({ err: "something went wrong re baba" });
  }
});
connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Server Connected Successfuly");
    });
  })
  .catch((err) => {
    console.log("Error in connecting database", err);
    process.exit(1);
  });
